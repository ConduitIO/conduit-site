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
	"regexp"
	"slices"
	"strings"
	"time"

	json "github.com/goccy/go-json"
	"github.com/gofri/go-github-ratelimit/github_ratelimit"
	"github.com/google/go-github/v61/github"
	"github.com/otiai10/gh-dependents/ghdeps"
	"golang.org/x/mod/modfile"
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

type Version struct {
	CurrentVersion string `json:"currentVersion"`
	UsingLatest    bool   `json:"usingLatest"`
}

// Repository represents GitHub repository information.
type Repository struct {
	Name                  string          `json:"nameWithOwner"`
	Description           string          `json:"description"`
	CreatedAt             string          `json:"createdAt"`
	URL                   string          `json:"url"`
	Stargazers            int             `json:"stargazerCount"`
	Forks                 int             `json:"forkCount"`
	LatestRelease         *Release        `json:"latestRelease,omitempty"`
	ToolsGoIsCorrect      bool            `json:"toolsGoIsCorrect"`
	MakefileIsCorrect     bool            `json:"makefileIsCorrect"`
	GoVersion             Version         `json:"goVersion"`
	ConnectorSDKVersion   Version         `json:"connectorSDKVersion"`
	ConduitCommonsVersion Version         `json:"conduitCommonsVersion"`
	HasScarfPixel         bool            `json:"hasScarfPixel"`
	WorkflowChecks        map[string]bool `json:"workflowChecks"`
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

type WorkflowCheck struct {
	Filename      string
	RequiredLines []string
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

	// Fetch latest Go version
	latestGoVersion, err := getLatestGoVersion()
	if err != nil {
		fmt.Printf("Error fetching latest Go version: %v\n", err)
		os.Exit(1)
	}

	// Fetch latest Conduit SDK version
	latestSDKVersion, err := fetchLatestTag(ctx, client, "conduitio", "conduit-connector-sdk")
	if err != nil {
		fmt.Printf("Error fetching latest Conduit SDK version: %v\n", err)
		os.Exit(1)
	}

	// Fetch latest Conduit Commons version
	latestCommonsVersion, err := fetchLatestTag(ctx, client, "conduitio", "conduit-commons")
	if err != nil {
		fmt.Printf("Error fetching latest Conduit Commons version: %v\n", err)
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
			os.Exit(1)
		}

		repoInfo.MakefileIsCorrect = makefileIsCorrect

		// Check tools.go
		toolsGoIsCorrect, err := checkToolsGoFile(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking tools.go for %s: %v\n", repo, err)
			os.Exit(1)
		}
		repoInfo.ToolsGoIsCorrect = toolsGoIsCorrect

		repoGoVersion, dependencies, err := fetchGoModDetails(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching go.mod details for %s: %v\n", repo, err)
			os.Exit(1)
		}
		repoInfo.GoVersion.CurrentVersion = repoGoVersion

		if repoGoVersion == "" {
			repoInfo.GoVersion.UsingLatest = false
		} else {
			repoInfo.GoVersion.UsingLatest = compareVersions(repoGoVersion, latestGoVersion)
		}

		if version, ok := dependencies["github.com/conduitio/conduit-connector-sdk"]; ok {
			repoInfo.ConnectorSDKVersion.CurrentVersion = version
			repoInfo.ConnectorSDKVersion.UsingLatest = compareVersions(version, latestSDKVersion)
		}

		if version, ok := dependencies["github.com/conduitio/conduit-commons"]; ok {
			repoInfo.ConduitCommonsVersion.CurrentVersion = version
			repoInfo.ConduitCommonsVersion.UsingLatest = compareVersions(version, latestCommonsVersion)
		}

		// Check for Scarf pixel
		hasScarfPixel, err := checkReadmeForScarfPixel(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking README.md for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.HasScarfPixel = hasScarfPixel

		// Check workflow files
		workflowResults, err := checkWorkflowFiles(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking workflows for %s: %v\n", repo, err)
			continue
		}

		repoInfo.WorkflowChecks = workflowResults

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

func fetchLatestTag(ctx context.Context, client *github.Client, owner, repo string) (string, error) {
	fmt.Printf("- 📥 Fetching latest tag for %s/%s...\n", owner, repo)

	tags, _, err := client.Repositories.ListTags(ctx, owner, repo, nil)
	if err != nil {
		return "", err
	}

	if len(tags) == 0 {
		return "", fmt.Errorf("no tags found for %s/%s", owner, repo)
	}
	return tags[0].GetName(), nil
}

func fetchDependents(_ context.Context, _ *github.Client, repo string) ([]string, error) {
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

func checkReadmeForScarfPixel(ctx context.Context, client *github.Client, repo string) (bool, error) {
	fmt.Println("- 📥 Checking README.md for Scarf pixel...")

	readmeContent, err := fetchFileContent(ctx, client, repo, "README.md")
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return false, nil
		}
		return false, err
	}

	pattern := `!\[scarf pixel\]\(https://static\.scarf\.sh/a\.png\?x-pxid=[a-f0-9-]+\)`
	re := regexp.MustCompile(pattern)

	return re.MatchString(readmeContent), nil
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

func fetchLatestRelease(ctx context.Context, client *github.Client, repo string) (*Release, error) {
	fmt.Println("- 📥 Fetching releases...")

	release, _, err := client.Repositories.GetLatestRelease(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
	)
	if err != nil {
		// If there is no release, return an empty release and no error (normally, it'd be a 404 Not Found error)
		return nil, nil
	}

	return &Release{
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

	makefileContent, err := fetchFileContent(ctx, client, repo, "Makefile")
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return false, nil
		}
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

	toolsGoContent, err := fetchFileContent(ctx, client, repo, "tools.go")
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return false, nil // tools.go file does not exist
		}
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

func fetchGoModDetails(ctx context.Context, client *github.Client, repo string) (string, map[string]string, error) {
	fmt.Println("- 📥 Fetching go.mod file...")

	goModContent, err := fetchFileContent(ctx, client, repo, "go.mod")
	if err != nil {
		if _, ok := err.(*github.ErrorResponse); ok {
			return "", nil, nil
		}
		return "", nil, err
	}

	modFile, err := modfile.Parse("go.mod", []byte(goModContent), nil)
	if err != nil {
		return "", nil, err
	}

	// Extract Go version
	goVersion := modFile.Go.Version

	// Extract dependencies
	dependencies := make(map[string]string)
	for _, req := range modFile.Require {
		dependencies[req.Mod.Path] = req.Mod.Version
	}

	return goVersion, dependencies, nil
}

func getLatestGoVersion() (string, error) {
	resp, err := http.Get("https://go.dev/dl/?mode=json")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch Go versions")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var versions []struct {
		Version string `json:"version"`
		Stable  bool   `json:"stable"`
	}

	if err := json.Unmarshal(body, &versions); err != nil {
		return "", err
	}

	// TODO: Check if it's possible that latest is not stable
	return versions[0].Version, nil
}

func compareVersions(repoVersion, latestVersion string) bool {
	return repoVersion == latestVersion
}

func fetchFileContent(ctx context.Context, client *github.Client, repo, path string) (string, error) {
	content, _, _, err := client.Repositories.GetContents(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		path,
		&github.RepositoryContentGetOptions{},
	)
	if err != nil {
		return "", err
	}

	return content.GetContent()
}

func checkWorkflowFiles(ctx context.Context, client *github.Client, repo string) (map[string]bool, error) {
	fmt.Println("- 📥 Checking workflow files...")
	results := make(map[string]bool)

	checks := []WorkflowCheck{
		{Filename: "lint.yml", RequiredLines: []string{"golangci/golangci-lint-action"}},
		{Filename: "dependabot-auto-merge-go.yml", RequiredLines: []string{"gh pr merge --auto --squash"}},
		{Filename: "project-automation.yml", RequiredLines: []string{"ConduitIO/automation/.github/workflows/project-automation.yml@main"}},
		{Filename: "release.yml", RequiredLines: []string{"goreleaser/goreleaser-action"}},
		{Filename: "test.yml", RequiredLines: []string{"make test"}},
		{Filename: "validate-generated-files.yml", RequiredLines: []string{"make install-tools generate"}},
	}

	// Get the list of files in the .github/workflows directory
	_, directoryContent, _, err := client.Repositories.GetContents(
		ctx,
		strings.Split(repo, "/")[0],
		strings.Split(repo, "/")[1],
		".github/workflows",
		&github.RepositoryContentGetOptions{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list workflow files: %w", err)
	}

	// Ensure directoryContent is not nil
	if directoryContent == nil {
		return nil, fmt.Errorf(".github/workflows directory not found")
	}

	// Map of file names to their content
	fileContentMap := make(map[string]string)

	// Fetch content for each workflow file
	for _, file := range directoryContent {
		if file.GetType() == "file" {
			content, err := fetchFileContent(ctx, client, repo, file.GetPath())
			if err != nil {
				return nil, fmt.Errorf("failed to fetch content for %s: %w", file.GetName(), err)
			}
			fileContentMap[file.GetName()] = content
		}
	}

	// Check each required workflow file
	for _, check := range checks {
		content, exists := fileContentMap[check.Filename]
		if !exists {
			results[check.Filename] = false
			continue
		}

		// Verify that all required lines are present
		results[check.Filename] = true
		for _, line := range check.RequiredLines {
			if !strings.Contains(content, line) {
				results[check.Filename] = false
				break
			}
		}
	}

	return results, nil
}
