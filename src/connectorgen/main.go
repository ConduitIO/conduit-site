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

	"github.com/conduitio/connectors-list/utils"
	json "github.com/goccy/go-json"
	"github.com/gofri/go-github-ratelimit/github_ratelimit"
	"github.com/google/go-github/v61/github"
)

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
	reposList, err := utils.FetchDependents(ctx, client, repoSDK)
	if err != nil {
		fmt.Printf("Error fetching dependent repositories: %v\n", err)
		os.Exit(1)
	}

	// Fetch required tasks from Makefile
	requiredTasks, err := utils.FetchRequiredTasks()
	if err != nil {
		fmt.Printf("Error fetching required tasks: %v\n", err)
		os.Exit(1)
	}

	// Fetch latest Go version
	latestGoVersion, err := utils.GetLatestGoVersion()
	if err != nil {
		fmt.Printf("Error fetching latest Go version: %v\n", err)
		os.Exit(1)
	}

	// Fetch latest Conduit SDK version
	latestSDKVersion, err := utils.FetchLatestTag(ctx, client, "conduitio", "conduit-connector-sdk")
	if err != nil {
		fmt.Printf("Error fetching latest Conduit SDK version: %v\n", err)
		os.Exit(1)
	}

	// Fetch latest Conduit Commons version
	latestCommonsVersion, err := utils.FetchLatestTag(ctx, client, "conduitio", "conduit-commons")
	if err != nil {
		fmt.Printf("Error fetching latest Conduit Commons version: %v\n", err)
		os.Exit(1)
	}

	var repositories []utils.Repository
	for _, repo := range reposList {
		fmt.Printf("Processing %v\n", repo)

		repoInfo, err := utils.FetchRepoInfo(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching repository info for %s: %v\n", repo, err)
			os.Exit(1)
		}

		release, err := utils.FetchLatestRelease(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching latest release for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.LatestRelease = release

		// Check Makefile
		makefileIsCorrect, err := utils.FetchAndCheckMakefileTasks(ctx, client, repo, requiredTasks)
		if err != nil {
			fmt.Printf("Error checking Makefile for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.MakefileIsCorrect = makefileIsCorrect

		// Check tools.go
		toolsGoIsCorrect, err := utils.CheckToolsGoFile(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking tools.go for %s: %v\n", repo, err)
			os.Exit(1)
		}
		repoInfo.ToolsGoIsCorrect = toolsGoIsCorrect

		repoGoVersion, dependencies, err := utils.FetchGoModDetails(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error fetching go.mod details for %s: %v\n", repo, err)
			os.Exit(1)
		}
		repoInfo.GoVersion.CurrentVersion = repoGoVersion

		if repoGoVersion == "" {
			repoInfo.GoVersion.UsingLatest = false
		} else {
			repoInfo.GoVersion.UsingLatest = utils.CompareVersions(repoGoVersion, latestGoVersion)
		}

		if version, ok := dependencies["github.com/conduitio/conduit-connector-sdk"]; ok {
			repoInfo.ConnectorSDKVersion.CurrentVersion = version
			repoInfo.ConnectorSDKVersion.UsingLatest = utils.CompareVersions(version, latestSDKVersion)
		}

		if version, ok := dependencies["github.com/conduitio/conduit-commons"]; ok {
			repoInfo.ConduitCommonsVersion.CurrentVersion = version
			repoInfo.ConduitCommonsVersion.UsingLatest = utils.CompareVersions(version, latestCommonsVersion)
		}

		// Check for Scarf pixel
		hasScarfPixel, err := utils.CheckReadmeForScarfPixel(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking README.md for %s: %v\n", repo, err)
			os.Exit(1)
		}

		repoInfo.HasScarfPixel = hasScarfPixel

		// Check workflow files
		workflowResults, err := utils.CheckWorkflowFiles(ctx, client, repo)
		if err != nil {
			fmt.Printf("Error checking workflows for %s: %v\n", repo, err)
			continue
		}

		repoInfo.WorkflowChecks = workflowResults

		repositories = append(repositories, repoInfo)
	}

	fmt.Println("- 🪚 Building connector.json...")
	slices.SortFunc(repositories, func(a, b utils.Repository) int {
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
