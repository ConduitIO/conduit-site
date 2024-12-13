package utils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/google/go-github/v61/github"
)

func FetchRequiredTasks() ([]string, error) {
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

func FetchAndCheckMakefileTasks(ctx context.Context, client *github.Client, repo string, requiredTasks []string) (bool, error) {
	fmt.Println("- 📥 Checking Makefile for specific tasks...")

	makefileContent, err := FetchFileContent(ctx, client, repo, "Makefile")
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
