// Copyright © 2025 Meroxa, Inc.
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
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"slices"
	"sort"
	"strings"
	"time"

	"github.com/google/go-github/v67/github"
	"github.com/otiai10/gh-dependents/ghdeps"
	"gopkg.in/yaml.v3"
)

//go:embed registry-config.yaml
var registryConfigYaml []byte

var connectorSdkRepoOwnerWithName = "conduitio/conduit-connector-sdk"

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
	NameWithOwner string    `json:"name_with_owner"`
	Description   string    `json:"description"`
	CreatedAt     string    `json:"created_at"`
	URL           string    `json:"url"`
	Stargazers    int       `json:"stargazer_count"`
	Forks         int       `json:"fork_count"`
	Releases      []Release `json:"releases"`
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

type registryConfig struct {
	Allow []filterExpr `yaml:"allow"`
	Deny  []filterExpr `yaml:"deny"`
}

type filterExpr struct {
	org  *regexp.Regexp
	repo *regexp.Regexp
}

func newFilterExpr(expr string) (filterExpr, error) {
	expr = strings.TrimSpace(expr)
	expr = strings.ToLower(expr)
	parts := strings.Split(expr, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return filterExpr{}, fmt.Errorf("invalid filter expression, expected <org>/<repo>")
	}

	org, repo := parts[0], parts[1]

	wildcardToRegex := func(pattern string) (*regexp.Regexp, error) {
		// Escape all special regex characters
		pattern = regexp.QuoteMeta(pattern)
		// Replace escaped asterisks (\*) with .*
		pattern = strings.ReplaceAll(pattern, "\\*", ".*")
		// Anchor regular expression to match the entire string
		pattern = "^" + pattern + "$"

		return regexp.Compile(pattern)
	}

	orgRegex, err := wildcardToRegex(org)
	if err != nil {
		return filterExpr{}, fmt.Errorf("failed to compile org regex: %w", err)
	}

	repoRegex, err := wildcardToRegex(repo)
	if err != nil {
		return filterExpr{}, fmt.Errorf("failed to compile repo regex: %w", err)
	}

	return filterExpr{
		org:  orgRegex,
		repo: repoRegex,
	}, nil
}

func (f filterExpr) Match(org, repo string) bool {
	org = strings.ToLower(org)
	repo = strings.ToLower(repo)
	return f.org.MatchString(org) && f.repo.MatchString(repo)
}

type CommandRegistry struct {
	client      *github.Client
	allowedFile string
	deniedFile  string

	config registryConfig
}

func NewCommandRegistry(client *github.Client, allowedFile, deniedFile string) *CommandRegistry {
	return &CommandRegistry{
		client:      client,
		allowedFile: allowedFile,
		deniedFile:  deniedFile,
	}
}

func (cmd *CommandRegistry) Execute(ctx context.Context) error {
	var err error
	cmd.config, err = cmd.parseConfig()
	if err != nil {
		return err
	}

	reposList, err := cmd.fetchDependents(connectorSdkRepoOwnerWithName)
	if err != nil {
		return fmt.Errorf("failed to fetch dependent repositories: %w", err)
	}

	allowed, denied := cmd.filterRepos(reposList)

	if err = cmd.processAllowedRepositories(ctx, allowed); err != nil {
		return fmt.Errorf("failed to process allowed repositories: %w", err)
	}

	if cmd.deniedFile != "" {
		if err = cmd.processDeniedRepositories(ctx, denied); err != nil {
			return fmt.Errorf("failed to process denied repositories: %w", err)
		}
	} else {
		fmt.Println("⏭️ Skipping denied repositories")
	}

	fmt.Println("✅ Done")
	return nil
}

func (cmd *CommandRegistry) processAllowedRepositories(ctx context.Context, repos []ghdeps.Repository) error {
	repositories := make([]Repository, len(repos))
	for i, repo := range repos {
		fmt.Printf("\n🕵  Processing repository %v/%v\n", repo.User, repo.Repo)

		repoInfo, err := cmd.fetchRepoInfo(ctx, repo)
		if err != nil {
			return fmt.Errorf("failed to fetch repository info for %q: %w", repo, err)
		}

		releases, err := cmd.fetchReleases(ctx, repo)
		if err != nil {
			return fmt.Errorf("failed to fetch releases for %q: %w", repo, err)
		}

		repoInfo.Releases = releases
		repositories[i] = repoInfo
	}

	fmt.Printf("\n🪚 Building %s ...\n", cmd.allowedFile)
	slices.SortFunc(repositories, func(a, b Repository) int {
		return strings.Compare(a.URL, b.URL)
	})
	connectorsJSON, err := json.MarshalIndent(repositories, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal repositories to JSON: %w", err)
	}

	err = os.WriteFile(cmd.allowedFile, connectorsJSON, 0644)
	if err != nil {
		return fmt.Errorf("failed to write %s: %w", cmd.allowedFile, err)
	}

	return nil
}

func (cmd *CommandRegistry) processDeniedRepositories(ctx context.Context, repos []ghdeps.Repository) error {
	repositories := make([]Repository, len(repos))
	for i, repo := range repos {
		repositories[i] = Repository{
			NameWithOwner: repo.User + "/" + repo.Repo,
			URL:           fmt.Sprintf("https://github.com/%s/%s", repo.User, repo.Repo),
			Stargazers:    repo.Stars,
			Forks:         repo.Forks,
		}
	}

	fmt.Printf("\n🪚 Building denied connectors file %s ...\n", cmd.deniedFile)
	slices.SortFunc(repositories, func(a, b Repository) int {
		return strings.Compare(a.URL, b.URL)
	})
	connectorsJSON, err := json.MarshalIndent(repositories, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal repositories to JSON: %w", err)
	}

	err = os.WriteFile(cmd.deniedFile, connectorsJSON, 0644)
	if err != nil {
		return fmt.Errorf("failed to write %s: %w", cmd.deniedFile, err)
	}

	return nil
}

func (cmd *CommandRegistry) parseConfig() (registryConfig, error) {
	var tmp struct {
		Allow []string `yaml:"allow"`
		Deny  []string `yaml:"deny"`
	}
	if err := yaml.Unmarshal(registryConfigYaml, &tmp); err != nil {
		return registryConfig{}, fmt.Errorf("failed to parse registry-config.yaml: %w", err)
	}

	var cfg registryConfig
	for _, expr := range tmp.Allow {
		fe, err := newFilterExpr(expr)
		if err != nil {
			return registryConfig{}, fmt.Errorf("failed to parse allow expression %q: %w", expr, err)
		}
		cfg.Allow = append(cfg.Allow, fe)
	}
	for _, expr := range tmp.Deny {
		fe, err := newFilterExpr(expr)
		if err != nil {
			return registryConfig{}, fmt.Errorf("failed to parse deny expression %q: %w", expr, err)
		}
		cfg.Deny = append(cfg.Deny, fe)
	}

	return cfg, nil
}

func (cmd *CommandRegistry) fetchDependents(repo string) ([]ghdeps.Repository, error) {
	fmt.Println("📥 Fetching dependents ...")

	c := ghdeps.NewCrawler(repo)
	if err := c.All(); err != nil {
		return nil, err
	}

	sort.Slice(c.Dependents, func(i, j int) bool {
		return strings.Compare(c.Dependents[i].User+"/"+c.Dependents[i].Repo, c.Dependents[j].User+"/"+c.Dependents[j].Repo) < 0
	})

	return c.Dependents, nil
}

// filterRepos filters the repositories based on the allow and deny lists in
// the config.
func (cmd *CommandRegistry) filterRepos(repos []ghdeps.Repository) (allowed []ghdeps.Repository, denied []ghdeps.Repository) {
REPOS:
	for _, repo := range repos {
		for _, denyExpr := range cmd.config.Deny {
			if denyExpr.Match(repo.User, repo.Repo) {
				denied = append(denied, repo)
				continue REPOS
			}
		}
		for _, allowExpr := range cmd.config.Allow {
			if allowExpr.Match(repo.User, repo.Repo) {
				allowed = append(allowed, repo)
				continue REPOS
			}
		}
		// If no allow or deny expression matched, add to denied list
		denied = append(denied, repo)
	}

	return allowed, denied
}

func (cmd *CommandRegistry) fetchRepoInfo(ctx context.Context, repo ghdeps.Repository) (Repository, error) {
	fmt.Println("  📥 Fetching repository information ...")

	repoInfo, _, err := cmd.client.Repositories.Get(ctx, repo.User, repo.Repo)
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

func (cmd *CommandRegistry) fetchReleases(ctx context.Context, repo ghdeps.Repository) ([]Release, error) {
	fmt.Println("  📥 Fetching releases ...")

	ghReleases, _, err := cmd.client.Repositories.ListReleases(ctx, repo.User, repo.Repo, nil)
	if err != nil {
		return nil, err
	}
	if len(ghReleases) == 0 {
		fmt.Println("  🤷 No releases found")
		return []Release{}, nil
	}

	// Fetch the latest release
	latestRel, _, err := cmd.client.Repositories.GetLatestRelease(ctx, repo.User, repo.Repo)
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

		releaseAssets, err := cmd.fetchReleaseAssets(ctx, repo, ghRel)
		if err != nil {
			return nil, fmt.Errorf("failed fetching assets for release %v: %w", ghRel.GetTagName(), err)
		}
		rel.Assets = releaseAssets

		releasesList = append(releasesList, rel)
	}

	return releasesList, nil
}

func (cmd *CommandRegistry) fetchReleaseAssets(ctx context.Context, repo ghdeps.Repository, release *github.RepositoryRelease) ([]Asset, error) {
	fmt.Printf("    📥 Fetching release assets for %v ...\n", release.GetTagName())

	assets, _, err := cmd.client.Repositories.ListReleaseAssets(ctx, repo.User, repo.Repo, release.GetID(), nil)
	if err != nil {
		return nil, err
	}

	var assetsList []Asset
	for _, asset := range assets {
		if asset.GetName() == "checksums.txt" {
			continue
		}

		assetOS, assetArch, ok := cmd.extractOSArch(asset, release.GetTagName())
		if !ok {
			fmt.Printf("    ⏩ Skipping asset %v\n", asset.GetName())
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

func (cmd *CommandRegistry) extractOSArch(asset *github.ReleaseAsset, tagName string) (string, string, bool) {
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
