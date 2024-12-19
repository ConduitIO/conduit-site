package utils

import (
	"context"
	"fmt"
	"slices"
	"strings"
	"time"

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

func FetchDependents(_ context.Context, _ *github.Client, repo string) ([]string, error) {
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

func FetchFileContent(ctx context.Context, client *github.Client, repo, path string) (string, error) {
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

func FetchLatestTag(ctx context.Context, client *github.Client, owner, repo string) (string, error) {
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

func FetchLatestRelease(ctx context.Context, client *github.Client, repo string) (*Release, error) {
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
