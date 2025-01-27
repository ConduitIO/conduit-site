// Copyright © 2025 Meroxa, Inc.
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
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/conduitio/yaml/v3"
	"github.com/google/go-github/v67/github"
)

type Metadata struct {
	FetchedAt time.Time `yaml:"fetchedAt"`
	CommitSHA string    `yaml:"commitSHA"`
}

var errNoConnectorYAML = errors.New("no connector.yaml found")

type CommandSpecifications struct {
	client         *github.Client
	connectorsFile string
	outputFolder   string
	force          bool
}

func NewCommandSpecifications(client *github.Client, connectorsFile, outputFolder string, force bool) *CommandSpecifications {
	return &CommandSpecifications{
		client:         client,
		connectorsFile: connectorsFile,
		outputFolder:   outputFolder,
		force:          force,
	}
}

func (cmd *CommandSpecifications) Execute(ctx context.Context) error {
	fmt.Printf("👀 Reading %s ...\n", cmd.connectorsFile)

	// Read and parse the input JSON file
	data, err := os.ReadFile(cmd.connectorsFile)
	if err != nil {
		return fmt.Errorf("failed to read input file: %w", err)
	}

	var repositories []Repository
	if err := json.Unmarshal(data, &repositories); err != nil {
		return fmt.Errorf("failed to parse JSON input: %w", err)
	}

	// Create output folder if it doesn't exist
	if err := os.MkdirAll(cmd.outputFolder, 0755); err != nil {
		return fmt.Errorf("failed to create output folder: %w", err)
	}

	// Process each repository
	for _, repo := range repositories {
		fmt.Printf("\n🕵  Processing repository %v\n", repo.NameWithOwner)

		// Split owner and repo name
		owner, repoName, found := strings.Cut(repo.NameWithOwner, "/")
		if !found {
			fmt.Printf("  ⚠️ Warning: invalid repository name format %s\n", repo.NameWithOwner)
			continue
		}

		if len(repo.Releases) == 0 {
			fmt.Printf("  ⚠️ Warning: no releases found for %s\n", repo.NameWithOwner)
			continue
		}

		for _, release := range repo.Releases {
			// Create folder path
			folderPath := filepath.Join(cmd.outputFolder, "github.com", owner, repoName+"@"+release.TagName)
			if err := os.MkdirAll(folderPath, 0755); err != nil {
				return fmt.Errorf("failed to create folder %s: %w", folderPath, err)
			}

			// Check if connector.yaml already exists
			commitSHA, err := cmd.getCommitForTag(ctx, owner, repoName, release.TagName)
			if err != nil {
				fmt.Printf("  ❌ Error: failed to get commit for tag %s: %w\n", release.TagName, err)
				continue
			}

			if !cmd.force && cmd.hasKnownCommitSHA(folderPath, commitSHA) {
				fmt.Printf("  ✅ Already have latest connector.yaml for %s@%s, skipping\n", repo.NameWithOwner, release.TagName)
				continue
			}

			// Fetch and write connector.yaml
			fmt.Printf("  📥 Fetching connector.yaml for tag %s...\n", release.TagName)
			yamlContent, err := cmd.fetchBlob(ctx, owner, repoName, commitSHA, "connector.yaml")
			if errors.Is(err, errNoConnectorYAML) {
				fmt.Printf("  ⚠️  Warning: no connector.yaml found for %s@%s\n",
					repo.NameWithOwner, release.TagName)
				// Still write the metadata file
			} else if err != nil {
				fmt.Printf("  ❌ Error: failed to fetch connector.yaml for %s@%s: %w\n",
					repo.NameWithOwner, release.TagName, err)
				continue
			}

			// Write connector.yaml
			if yamlContent != nil {
				connectorYamlPath := filepath.Join(folderPath, "connector.yaml")
				if err := os.WriteFile(connectorYamlPath, yamlContent, 0644); err != nil {
					return fmt.Errorf("failed to write connector.yaml for %s@%s: %w",
						repo.NameWithOwner, release.TagName, err)
				}

				fmt.Printf("  💾 Saved %s\n", connectorYamlPath)
			}

			// Write .metadata.yaml with current commit
			metadataContent, err := yaml.Marshal(Metadata{
				CommitSHA: commitSHA,
				FetchedAt: time.Now(),
			})
			if err != nil {
				return fmt.Errorf("failed to marshal metadata for %s@%s: %w",
					repo.NameWithOwner, release.TagName, err)
			}
			metadataPath := filepath.Join(folderPath, ".metadata.yaml")
			if err := os.WriteFile(metadataPath, metadataContent, 0644); err != nil {
				return fmt.Errorf("failed to write .metadata.yaml for %s@%s: %w\n",
					repo.NameWithOwner, release.TagName, err)
			}
			fmt.Printf("  💾 Saved %s\n", metadataPath)
		}
	}

	return nil
}

// hasKnownCommitSHA checks if the metadata file contains the expected commit SHA
func (cmd *CommandSpecifications) hasKnownCommitSHA(folderPath, commitSHA string) bool {
	// Read .metadata.yaml if it exists
	metadataContent, err := os.ReadFile(filepath.Join(folderPath, ".metadata.yaml"))
	if err != nil {
		// Metadata does not exist
		return false
	}

	var metadata Metadata
	if err := yaml.Unmarshal(metadataContent, &metadata); err != nil {
		// Failed to parse metadata
		return false
	}

	// Check if the commit SHA matches
	return metadata.CommitSHA == commitSHA
}

func (cmd *CommandSpecifications) getCommitForTag(ctx context.Context, owner, repo, tag string) (string, error) {
	refName := "refs/heads/main"
	if tag != "" {
		refName = "refs/tags/" + tag
	}

	// Get the reference to the specific tag
	ref, _, err := cmd.client.Git.GetRef(ctx, owner, repo, refName)
	if err != nil {
		log.Fatalf("failed to fetch reference for tag %s: %w", tag, err)
	}

	// Determine the commit SHA
	var commitSHA string
	if ref.Object.GetType() == "tag" { // Annotated tag
		// Resolve the object the tag refers to
		object, _, err := cmd.client.Git.GetTag(ctx, owner, repo, *ref.Object.SHA)
		if err != nil {
			log.Fatalf("failed to fetch annotated tag object for %s: %w", tag, err)
		}

		commitSHA = *object.Object.SHA
	} else if ref.Object.GetType() == "commit" { // Lightweight tag
		commitSHA = *ref.Object.SHA
	} else {
		log.Fatalf("unexpected object type %s for tag %s", ref.Object.GetType(), tag)
	}

	return commitSHA, nil
}

func (cmd *CommandSpecifications) fetchBlob(ctx context.Context, owner, repo, commitSHA, path string) ([]byte, error) {
	// Get the tree for the commit
	tree, _, err := cmd.client.Git.GetTree(ctx, owner, repo, commitSHA, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get tree: %w", err)
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
		// No connector.yaml
		return nil, errNoConnectorYAML
	}

	// Get the blob content
	blob, _, err := cmd.client.Git.GetBlobRaw(ctx, owner, repo, blobTreeEntry.GetSHA())
	if err != nil {
		return nil, fmt.Errorf("failed to get blob: %w", err)
	}

	return blob, nil
}
