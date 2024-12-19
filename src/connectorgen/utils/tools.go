package utils

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/go-github/v61/github"
)

func CheckToolsGoFile(ctx context.Context, client *github.Client, repo string) (bool, error) {
	fmt.Println("- 📥 Checking tools.go file...")

	toolsGoContent, err := FetchFileContent(ctx, client, repo, "tools.go")
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
