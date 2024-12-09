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
	"log"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/Masterminds/sprig/v3"
	"github.com/conduitio/yaml/v3"
	"github.com/google/go-github/v67/github"
)

// ConnectorSpecification represents the structure of the connector.yaml
type ConnectorSpecification struct {
	Version       string `yaml:"version"`
	Specification struct {
		Name        string `yaml:"name"`
		Summary     string `yaml:"summary"`
		Description string `yaml:"description"`
		Version     string `yaml:"version"`
		Author      string `yaml:"author"`
		Source      struct {
			Parameters []Parameter `yaml:"parameters"`
		} `yaml:"source"`
		Destination struct {
			Parameters []Parameter `yaml:"parameters"`
		} `yaml:"destination"`
	} `yaml:"specification"`
}

type DocsPage struct {
	ConnectorSpecification
	Repository
}

// Parameter represents a configuration parameter
type Parameter struct {
	Name        string       `yaml:"name"`
	Description string       `yaml:"description"`
	Type        string       `yaml:"type"`
	Default     string       `yaml:"default"`
	Validations []Validation `yaml:"validations"`
}

// Validation represents parameter validation rules
type Validation struct {
	Type  string `yaml:"type"`
	Value string `yaml:"value"`
}

func generateDocs(ctx context.Context, client *github.Client, repositories []*Repository, docsPath string) error {
	log.Printf("Parsing MDX template and generating documentation")

	// Parse the template
	tmpl, err := template.New("connector-docs").
		Funcs(funcMap).
		Funcs(sprig.TxtFuncMap()).
		Option("missingkey=zero").
		Parse(docsTmpl)
	if err != nil {
		return fmt.Errorf("failed to parse mdx template: %v", err)
	}

	// Ensure docs directory exists
	if err := cleanDocsDirectory(docsPath); err != nil {
		return fmt.Errorf("failed to clean %v: %v", docsPath, err)
	}

	// Process each repository
	for i, repo := range repositories {
		if shouldSkipDocsForRepo(repo) {
			log.Printf("Skipping docs for: %s", repo.NameWithOwner)
			continue
		}

		// Try to fetch the connector.yaml file
		yamlContent, err := fetchConnectorYAML(ctx, client, repo.NameWithOwner, repo.LatestReleaseTag())
		if err != nil {
			log.Printf("Failed to fetch connector.yaml for %s: %v", repo.NameWithOwner, err)
			continue
		}
		if yamlContent == "" {
			log.Printf("Skipping empty connector.yaml for %s", repo.NameWithOwner)
			continue
		}

		// Parse the YAML content
		var spec ConnectorSpecification
		if err := yaml.Unmarshal([]byte(yamlContent), &spec); err != nil {
			log.Printf("Failed to parse connector.yaml for %s: %v", repo.NameWithOwner, err)
			continue
		}

		// Generate filename
		filename := filepath.Join(docsPath, fmt.Sprintf("%v-%v.mdx", i, spec.Specification.Name))

		// Create the MDX file
		file, err := os.Create(filename)
		if err != nil {
			log.Printf("Failed to create MDX file for %s: %v", spec.Specification.Name, err)
			continue
		}
		defer file.Close()

		// The page's name is the connector name,
		// and it's a sub-page of the connectors' list page.
		repo.ConduitIODocsPage = spec.Specification.Name

		// Execute the template
		err = tmpl.Execute(file, DocsPage{
			ConnectorSpecification: spec,
			Repository:             *repo,
		})
		if err != nil {
			log.Printf("Failed to write MDX template for %s: %v", spec.Specification.Name, err)
			continue
		}

		log.Printf("Generated documentation for %s at %s", spec.Specification.Name, filename)
	}

	return nil
}

func cleanDocsDirectory(docsPath string) error {
	// Check if directory exists
	info, err := os.Stat(docsPath)
	if os.IsNotExist(err) {
		return fmt.Errorf("directory does not exist: %s", docsPath)
	}

	// Ensure it's actually a directory
	if !info.IsDir() {
		return fmt.Errorf("%s is not a directory", docsPath)
	}

	// Read directory contents
	entries, err := os.ReadDir(docsPath)
	if err != nil {
		return fmt.Errorf("error reading directory: %v", err)
	}

	// Iterate through and delete files (except index.mdx)
	for _, entry := range entries {
		if entry.Name() == "index.mdx" {
			continue
		}

		fullPath := filepath.Join(docsPath, entry.Name())

		// Remove file or directory
		if entry.IsDir() {
			if err := os.RemoveAll(fullPath); err != nil {
				return fmt.Errorf("error removing directory %s: %v", fullPath, err)
			}
		} else {
			if err := os.Remove(fullPath); err != nil {
				return fmt.Errorf("error removing file %s: %v", fullPath, err)
			}
		}
	}

	return nil
}

func shouldSkipDocsForRepo(r *Repository) bool {
	return strings.ToLower(r.Owner()) != "conduitio" &&
		strings.ToLower(r.Owner()) != "conduitio-labs"
}

func fetchConnectorYAML(ctx context.Context, client *github.Client, ownerRepo string, tag string) (string, error) {
	fmt.Printf("- 📥 Fetching connector.yaml for tag %s...\n", tag)

	// Split the repo into owner and name
	parts := strings.Split(ownerRepo, "/")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid repository format. Expected 'owner/repo'")
	}
	owner, repo := parts[0], parts[1]

	commitSHA, err := getCommitForTag(ctx, client, owner, repo, tag)
	if err != nil {
		return "", fmt.Errorf("failed to get commit for tag %s: %v", tag, err)
	}

	blob, err := fetchBlob(ctx, client, owner, repo, commitSHA, "connector.yaml")
	if err != nil {
		return "", fmt.Errorf("failed to get blob: %v", err)
	}

	// Decode the content (GitHub API returns base64 encoded content for blobs)
	return string(blob), nil
}

func fetchBlob(ctx context.Context, client *github.Client, owner string, repo string, commitSHA string, path string) ([]byte, error) {
	// Get the tree for the commit
	tree, _, err := client.Git.GetTree(ctx, owner, repo, commitSHA, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get tree: %v", err)
	}

	// Find the connector.yaml file
	var blobTreeEntry *github.TreeEntry
	for _, entry := range tree.Entries {
		if entry.GetPath() == path {
			blobTreeEntry = entry
			break
		}
	}

	if blobTreeEntry == nil {
		// connector.yaml
		return nil, nil
	}

	// Get the blob content
	blob, _, err := client.Git.GetBlobRaw(ctx, owner, repo, blobTreeEntry.GetSHA())
	if err != nil {
		return nil, fmt.Errorf("failed to get blob: %v", err)
	}

	return blob, nil
}

func getCommitForTag(ctx context.Context, client *github.Client, owner, repo, tag string) (string, error) {
	refName := "refs/heads/main"
	if tag != "" {
		refName = "refs/tags/" + tag
	}

	// Get the reference to the specific tag
	ref, _, err := client.Git.GetRef(ctx, owner, repo, refName)
	if err != nil {
		log.Fatalf("failed to fetch reference for tag %s: %v", tag, err)
	}

	// Determine the commit SHA
	var commitSHA string
	if ref.Object.GetType() == "tag" { // Annotated tag
		// Resolve the object the tag refers to
		object, _, err := client.Git.GetTag(ctx, owner, repo, *ref.Object.SHA)
		if err != nil {
			log.Fatalf("failed to fetch annotated tag object for %s: %v", tag, err)
		}

		commitSHA = *object.Object.SHA
	} else if ref.Object.GetType() == "commit" { // Lightweight tag
		commitSHA = *ref.Object.SHA
	} else {
		log.Fatalf("unexpected object type %s for tag %s", ref.Object.GetType(), tag)
	}

	return commitSHA, nil
}
