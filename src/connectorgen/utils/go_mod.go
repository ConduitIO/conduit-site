package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/go-github/v61/github"
	"golang.org/x/mod/modfile"
)

func FetchGoModDetails(ctx context.Context, client *github.Client, repo string) (string, map[string]string, error) {
	fmt.Println("- 📥 Fetching go.mod file...")

	goModContent, err := FetchFileContent(ctx, client, repo, "go.mod")
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

func GetLatestGoVersion() (string, error) {
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
