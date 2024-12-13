package utils

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/go-github/v61/github"
)

type WorkflowCheck struct {
	Filename      string
	RequiredLines []string
}

func CheckWorkflowFiles(ctx context.Context, client *github.Client, repo string) (map[string]bool, error) {
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
			content, err := FetchFileContent(ctx, client, repo, file.GetPath())
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
