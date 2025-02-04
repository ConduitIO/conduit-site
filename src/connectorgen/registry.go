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
	"encoding/json"
	"fmt"
	"os"
	"slices"
	"sort"
	"strings"
	"time"

	"github.com/google/go-github/v67/github"
	"github.com/otiai10/gh-dependents/ghdeps"
)

var connectorSdkRepoOwnerWithName = "conduitio/conduit-connector-sdk"

var excludedRepositories = []string{
	"ConduitIO/conduit",
	"ConduitIO/streaming-benchmarks",
	"ConduitIO/conduit-connector-template",
	"ConduitIO/conduit-operator",
	"ConduitIO/conduit-site",
	// Test modules within the SDK use SDK as a dependency,
	// so the SDK is included as a dependent of itself.
	"ConduitIO/conduit-connector-sdk",

	"ahamidi/conduit-connector-template",
	"gopherslab/conduit-connector-google-sheets",
	"gopherslab/conduit-connector-zendesk",
	"gopherslab/conduit-connector-redis",
	"hariso/conduit-connector-s3",
	"hariso/conduit-connector-kafka",
	"hariso/conduit-connector-foo",
	"hariso/foobar",
	"neha-Gupta1/conduit-connector-bigquery",
	"neovintage/conduit-connector-redis",
	"tsinghgill/conduit-connector-notion",
	"WeirdMagician/conduit-connector-google-cloudstorage",
	"GevorgGal/conduit-connector-influxdb",
	"EnigmaForLife/shared",
	"frillyrequi/conduit-connector-sdk",
	"hariso/crispy-octo-system",
	"hariso/cuddly-chainsaw",
	"hariso/reimagined-octo-umbrella",
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

type CommandRegistry struct {
	client     *github.Client
	outputFile string
}

func NewCommandRegistry(client *github.Client, outputFile string) *CommandRegistry {
	return &CommandRegistry{
		client:     client,
		outputFile: outputFile,
	}
}

func (cmd *CommandRegistry) Execute(ctx context.Context) error {
	reposList, err := cmd.fetchDependents(connectorSdkRepoOwnerWithName)
	if err != nil {
		return fmt.Errorf("failed to fetch dependent repositories: %w", err)
	}

	var repositories []Repository
	for _, repo := range reposList {
		fmt.Printf("\n🕵  Processing repository %v\n", repo)

		repoInfo, err := cmd.fetchRepoInfo(ctx, repo)
		if err != nil {
			return fmt.Errorf("failed to fetch repository info for %q: %w", repo, err)
		}

		releases, err := cmd.fetchReleases(ctx, repo)
		if err != nil {
			return fmt.Errorf("failed to fetch releases for %q: %w", repo, err)
		}

		repoInfo.Releases = releases
		repositories = append(repositories, repoInfo)
	}

	fmt.Printf("\n🪚 Building %s ...\n", cmd.outputFile)
	slices.SortFunc(repositories, func(a, b Repository) int {
		return strings.Compare(a.URL, b.URL)
	})
	connectorsJSON, err := json.MarshalIndent(repositories, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal repositories to JSON: %w", err)
	}

	err = os.WriteFile(cmd.outputFile, connectorsJSON, 0644)
	if err != nil {
		return fmt.Errorf("failed to write %s: %w", cmd.outputFile, err)
	}

	fmt.Println("✅ Done")
	return nil
}

func (cmd *CommandRegistry) fetchDependents(repo string) ([]string, error) {
	fmt.Println("📥 Fetching dependents ...")

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

	sort.Strings(reposList)

	return reposList, nil
}

func (cmd *CommandRegistry) fetchRepoInfo(ctx context.Context, repo string) (Repository, error) {
	fmt.Println("  📥 Fetching repository information ...")

	repoInfo, _, err := cmd.client.Repositories.Get(ctx, strings.Split(repo, "/")[0], strings.Split(repo, "/")[1])
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

func (cmd *CommandRegistry) fetchReleases(ctx context.Context, ownerRepo string) ([]Release, error) {
	fmt.Println("  📥 Fetching releases ...")

	owner, repoName := strings.Split(ownerRepo, "/")[0], strings.Split(ownerRepo, "/")[1]
	ghReleases, _, err := cmd.client.Repositories.ListReleases(
		ctx,
		owner,
		repoName,
		nil,
	)
	if err != nil {
		return nil, err
	}
	if len(ghReleases) == 0 {
		fmt.Println("  🤷 No releases found")
		return []Release{}, nil
	}

	// Fetch the latest release
	latestRel, _, err := cmd.client.Repositories.GetLatestRelease(ctx, owner, repoName)
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

		releaseAssets, err := cmd.fetchReleaseAssets(ctx, ownerRepo, ghRel)
		if err != nil {
			return nil, fmt.Errorf("failed fetching assets for release %v: %w", ghRel.GetTagName(), err)
		}
		rel.Assets = releaseAssets

		releasesList = append(releasesList, rel)
	}

	return releasesList, nil
}

func (cmd *CommandRegistry) fetchReleaseAssets(ctx context.Context, repo string, release *github.RepositoryRelease) ([]Asset, error) {
	fmt.Printf("    📥 Fetching release assets for %v ...\n", release.GetTagName())

	assets, _, err := cmd.client.Repositories.ListReleaseAssets(
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
