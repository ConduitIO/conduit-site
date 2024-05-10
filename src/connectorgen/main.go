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
	"fmt"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/gofri/go-github-ratelimit/github_ratelimit"
	"github.com/google/go-github/v61/github"
	"github.com/otiai10/gh-dependents/ghdeps"
)

var excludedRepositories = []string{
	"ConduitIO/conduit",
	"ConduitIO/streaming-benchmarks",
	"ConduitIO/conduit-connector-template",

	"ahamidi/conduit-connector-template",
	"gopherslab/conduit-connector-google-sheets",
	"gopherslab/conduit-connector-zendesk",
	"gopherslab/conduit-connector-redis",
	"hariso/awesomeProject",
	"neha-Gupta1/conduit-connector-bigquery",
	"neovintage/conduit-connector-redis",
	"tsinghgill/conduit-connector-notion",
	"WeirdMagician/conduit-connector-google-cloudstorage",
	"GevorgGal/conduit-connector-influxdb",
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

// Repository represents GitHub repository information.
type Repository struct {
	Name        string    `json:"nameWithOwner"`
	Description string    `json:"description"`
	CreatedAt   string    `json:"createdAt"`
	URL         string    `json:"url"`
	Stargazers  int       `json:"stargazerCount"`
	Forks       int       `json:"forkCount"`
	Releases    []Release `json:"releases"`
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

	outputFile := "connectors.json"
	if len(os.Args) == 2 {
		outputFile = os.Args[1]
	}

	ctx := context.Background()
	rateLimiter, err := github_ratelimit.NewRateLimitWaiterClient(nil)
	if err != nil {
		fmt.Printf("Failed creating rate-limiting client: %v\n", err)
		os.Exit(1)
	}

	client := github.NewClient(rateLimiter).WithAuthToken(token)

	repoSDK := "conduitio/conduit-connector-sdk"
	reposList, err := fetchDependents(ctx, client, repoSDK)
	if err != nil {
		fmt.Printf("Error fetching dependent repositories: %v\n", err)
		os.Exit(1)
	}

	var repositories []Repository
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
		repositories = append(repositories, repoInfo)
	}

	fmt.Println("- 🪚 Building connector.json...")
	slices.SortFunc(repositories, func(a, b Repository) int {
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

func fetchDependents(ctx context.Context, client *github.Client, repo string) ([]string, error) {
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
		Name:        repoInfo.GetFullName(),
		Description: repoInfo.GetDescription(),
		CreatedAt:   repoInfo.GetCreatedAt().String(),
		URL:         repoInfo.GetHTMLURL(),
		Stargazers:  repoInfo.GetStargazersCount(),
		Forks:       repoInfo.GetForksCount(),
	}, nil
}

func fetchReleases(ctx context.Context, client *github.Client, repo string) ([]Release, error) {
	fmt.Println("- 📥 Fetching releases...")

	releases, _, err := client.Repositories.ListReleases(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		nil,
	)
	if err != nil {
		return nil, err
	}

	releasesList := make([]Release, 0, len(releases))
	for _, release := range releases {
		releaseAssets, err := fetchReleaseAssets(ctx, client, repo, release)
		if err != nil {
			return nil, fmt.Errorf("failed fetching assets for release %v: %w", release.GetTagName(), err)
		}

		releasesList = append(releasesList, Release{
			TagName:     release.GetTagName(),
			Name:        release.GetName(),
			Body:        release.GetBody(),
			Draft:       release.GetDraft(),
			Prerelease:  release.GetPrerelease(),
			PublishedAt: release.GetPublishedAt().Time,
			HTMLURL:     release.GetHTMLURL(),
			Assets:      releaseAssets,
		})
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
