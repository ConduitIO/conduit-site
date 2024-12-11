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
	"io"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	json "github.com/goccy/go-json"
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
	"hariso/conduit-connector-s3",
	"neha-Gupta1/conduit-connector-bigquery",
	"neovintage/conduit-connector-redis",
	"tsinghgill/conduit-connector-notion",
	"WeirdMagician/conduit-connector-google-cloudstorage",
	"GevorgGal/conduit-connector-influxdb",
	"EnigmaForLife/shared",
	"ConduitIO/conduit-operator",
}

// Repository represents GitHub repository information.
type Repository struct {
	Name              string  `json:"nameWithOwner"`
	Description       string  `json:"description"`
	CreatedAt         string  `json:"createdAt"`
	URL               string  `json:"url"`
	Stargazers        int     `json:"stargazerCount"`
	Forks             int     `json:"forkCount"`
	LatestRelease     Release `json:"latestRelease"`
	ToolsGoIsCorrect  bool    `json:"toolsGoIsCorrect"`
	MakefileIsCorrect bool    `json:"makefileIsCorrect"`
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

	// Fetch required tasks from Makefile
	requiredTasks, err := fetchRequiredTasks()
	if err != nil {
		fmt.Printf("Error fetching required tasks: %v\n", err)
		os.Exit(1)
	}

	var repositories []Repository
	for _, repo := range reposList[:5] {
		fmt.Printf("Processing %v\n", repo)

		repoInfo, err := fetchRepoInfo(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching repository info for %s: %v\n", repo, err)
			os.Exit(1)
		}

		release, err := fetchLatestRelease(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching latest release for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.LatestRelease = release

		// Check Makefile
		makefileIsCorrect, err := fetchAndCheckMakefileTasks(ctx, client, repo, requiredTasks)
		if err != nil {
			fmt.Printf("Error checking Makefile for %s: %v\n", repo, err)
			continue
		}

		repoInfo.MakefileIsCorrect = makefileIsCorrect

		// Check tools.go
		toolsGoIsCorrect, err := checkToolsGoFile(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking tools.go for %s: %v\n", repo, err)
			continue
		}
		repoInfo.ToolsGoIsCorrect = toolsGoIsCorrect

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

func fetchLatestRelease(ctx context.Context, client *github.Client, repo string) (Release, error) {
	fmt.Println("- 📥 Fetching releases...")

	release, _, err := client.Repositories.GetLatestRelease(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
	)
	if err != nil {
		// If there is no release, return an empty release and no error (normally, it'd be a 404 Not Found error)
		return Release{}, nil
	}

	return Release{
		TagName:     release.GetTagName(),
		Name:        release.GetName(),
		Body:        release.GetBody(),
		Draft:       release.GetDraft(),
		Prerelease:  release.GetPrerelease(),
		PublishedAt: release.GetPublishedAt().Time,
		HTMLURL:     release.GetHTMLURL(),
	}, nil
}

func fetchRequiredTasks() ([]string, error) {
	// We assume these are the right ones
	url := "https://raw.githubusercontent.com/ConduitIO/conduit-connector-sdk/main/Makefile"

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch file from URL: %s", url)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return extractTasksFromMakefile(string(body)), nil
}

func extractTasksFromMakefile(content string) []string {
	var tasks []string
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasSuffix(line, ":") && !strings.HasPrefix(line, "#") {
			task := strings.TrimSuffix(line, ":")
			tasks = append(tasks, task)
		}
	}
	return tasks
}

func fetchAndCheckMakefileTasks(ctx context.Context, client *github.Client, repo string, requiredTasks []string) (bool, error) {
	fmt.Println("- 📥 Checking Makefile for specific tasks...")

	content, _, _, err := client.Repositories.GetContents(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		"Makefile",
		&github.RepositoryContentGetOptions{},
	)
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return false, nil
		}
		return false, err
	}

	makefileContent, err := content.GetContent()
	if err != nil {
		return false, err
	}

	for _, task := range requiredTasks {
		if !strings.Contains(makefileContent, task+":") {
			return false, nil
		}
	}

	return true, nil
}

func checkToolsGoFile(ctx context.Context, client *github.Client, repo string) (bool, error) {
	fmt.Println("- 📥 Checking tools.go file...")

	content, _, _, err := client.Repositories.GetContents(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		"tools.go",
		&github.RepositoryContentGetOptions{},
	)
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return false, nil // tools.go file does not exist
		}
		return false, err
	}

	toolsGoContent, err := content.GetContent()
	if err != nil {
		return false, err
	}

	// Check for required dependencies
	requiredDeps := []string{
		"github.com/golangci/golangci-lint/cmd/golangci-lint",
		"github.com/conduitio/conduit-commons/paramgen",
	}

	for _, dep := range requiredDeps {
		if !strings.Contains(toolsGoContent, dep) {
			return false, nil // Missing required dependency
		}
	}

	return true, nil
}
