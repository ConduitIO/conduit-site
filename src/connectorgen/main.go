// Copyright © 2024 Meroxa, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"os"
	"slices"
	"strings"
	"text/template"
	"time"

	"github.com/goccy/go-json"
	"github.com/gofri/go-github-ratelimit/github_ratelimit"
	"github.com/google/go-github/v67/github"
	"github.com/otiai10/gh-dependents/ghdeps"
)

var excludedRepositories = []string{
	"ConduitIO/conduit",
	"ConduitIO/streaming-benchmarks",
	"ConduitIO/conduit-connector-template",
	"ConduitIO/conduit-operator",

	"ahamidi/conduit-connector-template",
	"gopherslab/conduit-connector-google-sheets",
	"gopherslab/conduit-connector-zendesk",
	"gopherslab/conduit-connector-redis",
	"hariso/conduit-connector-s3",
	"neha-Gupta1/conduit-connector-bigquery",
	"neovintage/conduit-connector-redis",
	"tsinghgill/conduit-connector-notion",
	"WeirdMagician/conduit-connector-google-cloudstorage",
	"GevorgGal/conduit-connector-influxdb",
	"EnigmaForLife/shared",
}

// maps architectures found in asset names to GOARCH
var assetArchToGOARCH = map[string]string{
	"x86_64": "amd64",
	"i386":   "386",
}

// knownOS is the list of past, present, and future known GOOS values.
var knownOS = map[string]bool{
	"aix":       true,
	"android":   true,
	"darwin":    true,
	"dragonfly": true,
	"freebsd":   true,
	"hurd":      true,
	"illumos":   true,
	"ios":       true,
	"js":        true,
	"linux":     true,
	"nacl":      true,
	"netbsd":    true,
	"openbsd":   true,
	"plan9":     true,
	"solaris":   true,
	"wasip1":    true,
	"windows":   true,
	"zos":       true,
}

// knownArch is the list of past, present, and future known GOARCH values.
var knownArch = map[string]bool{
	"386":         true,
	"amd64":       true,
	"amd64p32":    true,
	"arm":         true,
	"armbe":       true,
	"arm64":       true,
	"arm64be":     true,
	"loong64":     true,
	"mips":        true,
	"mipsle":      true,
	"mips64":      true,
	"mips64le":    true,
	"mips64p32":   true,
	"mips64p32le": true,
	"ppc":         true,
	"ppc64":       true,
	"ppc64le":     true,
	"riscv":       true,
	"riscv64":     true,
	"s390":        true,
	"s390x":       true,
	"sparc":       true,
	"sparc64":     true,
	"wasm":        true,
}

//go:embed connector-docs-mdx.tmpl
var docsTmpl string

var funcMap = template.FuncMap{
	"formatParameterValueTable":      formatParameterValueTable,
	"formatParameterValueYAML":       formatParameterValueYAML,
	"formatParameterDescriptionYAML": formatParameterDescriptionYAML,
}

// formatParameterValue formats the value of a configuration parameter.
func formatParameterValueTable(value string) string {
	switch {
	case value == "":
		return `<Chip label="null" />`
	case strings.Contains(value, "\n"):
		// specifically used in the javascript processor
		return fmt.Sprintf("\n```js\n%s\n```\n", value)
	default:
		return fmt.Sprintf("`%s`", value)
	}
}

func formatParameterDescriptionYAML(description string) string {
	const (
		indentLen  = 10
		prefix     = "# "
		lineLen    = 80
		tmpNewLine = "〠"
	)

	// remove markdown new lines
	description = strings.ReplaceAll(description, "\n\n", tmpNewLine)
	description = strings.ReplaceAll(description, "\n", " ")
	description = strings.ReplaceAll(description, tmpNewLine, "\n")

	formattedDescription := formatMultiline(description, strings.Repeat(" ", indentLen)+prefix, lineLen)
	// remove first indent and last new line
	formattedDescription = formattedDescription[indentLen : len(formattedDescription)-1]
	return formattedDescription
}

func formatMultiline(
	input string,
	prefix string,
	maxLineLen int,
) string {
	textLen := maxLineLen - len(prefix)

	// split the input into lines of length textLen
	lines := strings.Split(input, "\n")
	var formattedLines []string
	for _, line := range lines {
		if len(line) <= textLen {
			formattedLines = append(formattedLines, line)
			continue
		}

		// split the line into multiple lines, don't break words
		words := strings.Fields(line)
		var formattedLine string
		for _, word := range words {
			if len(formattedLine)+len(word) > textLen {
				formattedLines = append(formattedLines, formattedLine[1:])
				formattedLine = ""
			}
			formattedLine += " " + word
		}
		if formattedLine != "" {
			formattedLines = append(formattedLines, formattedLine[1:])
		}
	}

	// combine lines including indent and prefix
	var formatted string
	for _, line := range formattedLines {
		formatted += prefix + line + "\n"
	}

	return formatted
}

func formatParameterValueYAML(value string) string {
	switch {
	case value == "":
		return `""`
	case strings.Contains(value, "\n"):
		// specifically used in the javascript processor
		formattedValue := formatMultiline(value, "            ", 10000)
		return fmt.Sprintf("|\n%s", formattedValue)
	default:
		return fmt.Sprintf(`"%s"`, value)
	}
}

// Repository represents GitHub repository information.
type Repository struct {
	NameWithOwner     string    `json:"nameWithOwner"`
	Description       string    `json:"description"`
	ConduitIODocsPage string    `json:"conduitIODocsPage"`
	CreatedAt         string    `json:"createdAt"`
	URL               string    `json:"url"`
	Stargazers        int       `json:"stargazerCount"`
	Forks             int       `json:"forkCount"`
	Releases          []Release `json:"releases"`
}

func (r Repository) LatestReleaseTag() string {
	for _, rel := range r.Releases {
		if rel.IsLatest {
			return rel.TagName
		}
	}

	return ""
}

func (r Repository) Name() string {
	parts := strings.Split(r.NameWithOwner, "/")
	if len(parts) != 2 {
		panic(fmt.Errorf("invalid repository name: %s", r.NameWithOwner))
	}

	return parts[1]
}

func (r Repository) Owner() string {
	parts := strings.Split(r.NameWithOwner, "/")
	if len(parts) != 2 {
		panic(fmt.Errorf("invalid repository name: %s", r.NameWithOwner))
	}

	return parts[0]
}

// Release represents a GitHub release.
type Release struct {
	TagName     string    `json:"tag_name"`
	Name        string    `json:"name"`
	Body        string    `json:"body"`
	Draft       bool      `json:"draft"`
	Prerelease  bool      `json:"prerelease"`
	PublishedAt time.Time `json:"published_at"`
	HTMLURL     string    `json:"html_url"`
	Assets      []Asset   `json:"assets"`
	IsLatest    bool      `json:"is_latest"`
}

// Asset represents a release asset.
type Asset struct {
	Name            string    `json:"name"`
	OS              string    `json:"os"`
	Arch            string    `json:"arch"`
	ContentType     string    `json:"content_type"`
	BrowserDownload string    `json:"browser_download_url"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DownloadCount   int       `json:"download_count"`
	Size            int       `json:"size"`
}

func main() {
	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		fmt.Println("Please set GITHUB_TOKEN environment variable")
		os.Exit(1)
	}

	args := os.Args[1:]
	if len(args) > 2 {
		fmt.Printf("Too many arguments (%v), expected 2", len(args))
	}

	outputFile := "connectors.json"
	if len(args) > 0 {
		outputFile = args[0]
	}

	connectorDocsPath := "docs"
	if len(args) > 1 {
		connectorDocsPath = args[1]
	}

	ctx := context.Background()
	rateLimiter, err := github_ratelimit.NewRateLimitWaiterClient(nil)
	if err != nil {
		fmt.Printf("Failed creating rate-limiting client: %v\n", err)
		os.Exit(1)
	}

	client := github.NewClient(rateLimiter).WithAuthToken(token)

	repoSDK := "conduitio/conduit-connector-sdk"
	reposList, err := fetchDependents(repoSDK)
	if err != nil {
		fmt.Printf("Error fetching dependent repositories: %v\n", err)
		os.Exit(1)
	}

	var repositories []*Repository
	for _, repo := range reposList {
		fmt.Printf("Processing %v\n", repo)

		repoInfo, err := fetchRepoInfo(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching repository info for %s: %v\n", repo, err)
			os.Exit(1)
		}

		releases, err := fetchReleases(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching releases for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.Releases = releases
		repositories = append(repositories, &repoInfo)
	}

	err = generateDocs(ctx, client, repositories, connectorDocsPath)
	if err != nil {
		fmt.Printf("Error generating docs: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("- 🪚 Building connector.json...")
	slices.SortFunc(repositories, func(a, b *Repository) int {
		return strings.Compare(a.URL, b.URL)
	})
	connectorsJSON, err := json.MarshalIndent(repositories, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling repositories to JSON: %v\n", err)
		os.Exit(1)
	}

	err = os.WriteFile(outputFile, connectorsJSON, 0644)
	if err != nil {
		fmt.Printf("Error writing connectors.json: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Done")
}

func fetchDependents(repo string) ([]string, error) {
	fmt.Println("- 📥 Fetching dependents...")

	c := ghdeps.NewCrawler(repo)
	if err := c.All(); err != nil {
		return nil, err
	}

	var reposList []string
	for _, dependent := range c.Dependents {
		name := dependent.User + "/" + dependent.Repo
		if !slices.Contains(excludedRepositories, name) {
			reposList = append(reposList, name)
		}
	}

	return reposList, nil
}

func fetchRepoInfo(ctx context.Context, client *github.Client, repo string) (Repository, error) {
	fmt.Println("- 📥 Fetching repository information...")

	repoInfo, _, err := client.Repositories.Get(ctx, strings.Split(repo, "/")[0], strings.Split(repo, "/")[1])
	if err != nil {
		return Repository{}, err
	}

	return Repository{
		NameWithOwner: repoInfo.GetFullName(),
		Description:   repoInfo.GetDescription(),
		CreatedAt:     repoInfo.GetCreatedAt().String(),
		URL:           repoInfo.GetHTMLURL(),
		Stargazers:    repoInfo.GetStargazersCount(),
		Forks:         repoInfo.GetForksCount(),
	}, nil
}

func fetchReleases(ctx context.Context, client *github.Client, ownerRepo string) ([]Release, error) {
	fmt.Println("- 📥 Fetching releases...")

	owner, repoName := strings.Split(ownerRepo, "/")[0], strings.Split(ownerRepo, "/")[1]
	ghReleases, _, err := client.Repositories.ListReleases(
		ctx,
		owner,
		repoName,
		nil,
	)
	if err != nil {
		return nil, err
	}

	// Fetch the latest release
	latestRel, _, err := client.Repositories.GetLatestRelease(ctx, owner, repoName)
	if err != nil && !is404Error(err) {
		return nil, fmt.Errorf("failed to fetch latest release: %w", err)
	}

	releasesList := make([]Release, 0, len(ghReleases))
	for _, ghRel := range ghReleases {
		isLatest := latestRel != nil && (*ghRel.ID == *latestRel.ID)
		rel := Release{
			TagName:     ghRel.GetTagName(),
			Name:        ghRel.GetName(),
			Body:        ghRel.GetBody(),
			Draft:       ghRel.GetDraft(),
			Prerelease:  ghRel.GetPrerelease(),
			PublishedAt: ghRel.GetPublishedAt().Time,
			HTMLURL:     ghRel.GetHTMLURL(),
			IsLatest:    isLatest,
		}

		releaseAssets, err := fetchReleaseAssets(ctx, client, ownerRepo, ghRel)
		if err != nil {
			return nil, fmt.Errorf("failed fetching assets for release %v: %w", ghRel.GetTagName(), err)
		}
		rel.Assets = releaseAssets

		releasesList = append(releasesList, rel)
	}

	return releasesList, nil
}

func fetchReleaseAssets(ctx context.Context, client *github.Client, repo string, release *github.RepositoryRelease) ([]Asset, error) {
	fmt.Printf("- 📥 Fetching release assets for %v...\n", release.GetTagName())

	assets, _, err := client.Repositories.ListReleaseAssets(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		release.GetID(),
		nil,
	)
	if err != nil {
		return nil, err
	}

	var assetsList []Asset
	for _, asset := range assets {
		if asset.GetName() == "checksums.txt" {
			continue
		}

		assetOS, assetArch, ok := extractOSArch(asset, release.GetTagName())
		if !ok {
			fmt.Printf("skipping asset %v\n", asset.GetName())
			continue
		}

		assetsList = append(assetsList, Asset{
			Name:        asset.GetName(),
			OS:          assetOS,
			Arch:        assetArch,
			ContentType: asset.GetContentType(),
			// use our conduit-connectors-releases scarf package link
			BrowserDownload: strings.Replace(asset.GetBrowserDownloadURL(), "github.com", "conduit.gateway.scarf.sh/connector/download", 1),
			CreatedAt:       asset.GetCreatedAt().Time,
			UpdatedAt:       asset.GetUpdatedAt().Time,
			DownloadCount:   asset.GetDownloadCount(),
			Size:            asset.GetSize(),
		})
	}

	return assetsList, nil
}

func extractOSArch(asset *github.ReleaseAsset, tagName string) (string, string, bool) {
	// example asset name:  conduit-connector-grpc-server_0.1.0_Windows_x86_64.tar.gz
	// example tag name: v0.1.0
	version := strings.TrimPrefix(tagName, "v")

	// get part after version: Windows_x86_64.tar.gz
	_, osArch, _ := strings.Cut(asset.GetName(), version+"_")
	osArch, _, _ = strings.Cut(osArch, ".")

	assetOS, assetArch, _ := strings.Cut(osArch, "_")
	assetOS = strings.ToLower(assetOS)
	if arch, ok := assetArchToGOARCH[assetArch]; ok {
		assetArch = arch
	}

	return assetOS, assetArch, knownOS[assetOS] && knownArch[assetArch]
}

func is404Error(err error) bool {
	var githubErr *github.ErrorResponse
	return errors.As(err, &githubErr) && githubErr.Response.StatusCode == 404
}
