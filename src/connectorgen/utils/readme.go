package utils

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/go-github/v61/github"
)

func CheckReadmeForScarfPixel(ctx context.Context, client *github.Client, repo string) (bool, error) {
	fmt.Println("- 📥 Checking README.md for Scarf pixel...")

	readmeContent, err := FetchFileContent(ctx, client, repo, "README.md")
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

func FetchRepoInfo(ctx context.Context, client *github.Client, repo string) (Repository, error) {
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
