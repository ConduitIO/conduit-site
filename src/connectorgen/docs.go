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
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/conduitio/conduit-connector-sdk/cmd/readmegen/util"
	"github.com/conduitio/yaml/v3"
)

type CommandDocs struct {
	connectorsFile string
	specsFolder    string
	outputFolder   string
}

func NewCommandDocs(connectorsFile, specsFolder, outputFolder string) *CommandDocs {
	return &CommandDocs{
		connectorsFile: connectorsFile,
		specsFolder:    specsFolder,
		outputFolder:   outputFolder,
	}
}

type data struct {
	Repository
	Specifications map[string]any
}

func (cmd *CommandDocs) Execute(ctx context.Context) error {
	fmt.Printf("👀 Reading %s ...\n", cmd.connectorsFile)

	// Read and parse the input JSON file
	connectorsJSON, err := os.ReadFile(cmd.connectorsFile)
	if err != nil {
		return fmt.Errorf("failed to read input file: %w", err)
	}

	var repositories []Repository
	if err := json.Unmarshal(connectorsJSON, &repositories); err != nil {
		return fmt.Errorf("failed to parse JSON input: %w", err)
	}

	// Create output folder if it doesn't exist
	if err := os.MkdirAll(cmd.outputFolder, 0755); err != nil {
		return fmt.Errorf("failed to create output folder: %w", err)
	}

	// Process each repository
	for i, repo := range repositories {
		fmt.Printf("\n🕵  Processing repository %v\n", repo.NameWithOwner)

		specifications := cmd.loadSpecifications(repo)
		if len(specifications) == 0 {
			fmt.Printf("  ⚠️ Warning: no connector.yaml found for %s, skipping\n", repo.NameWithOwner)
			continue
		}
		connectorName := getConnectorName(specifications)
		if connectorName == "" {
			fmt.Printf("  ⚠️ Warning: could not get connector name for %s, skipping\n", repo.NameWithOwner)
			continue
		}

		err := cmd.generateDocPage(i, connectorName, repo, specifications)
		if err != nil {
			return fmt.Errorf("failed to generate documentation for %v: %w", repo.NameWithOwner, err)
		}

		fmt.Println("  ✅ Documentation generated")
	}

	return nil
}

func getConnectorName(specifications map[string]any) string {
	if len(specifications) == 0 {
		return ""
	}
	latestSpecs, ok := specifications["latest"].(map[string]any)
	if !ok {
		return ""
	}
	spec, ok := latestSpecs["specification"].(map[string]any)
	if !ok {
		return ""
	}
	name, ok := spec["name"].(string)
	if !ok {
		return ""
	}
	return name
}

func (cmd *CommandDocs) loadSpecifications(repo Repository) map[string]any {
	// Split owner and repo name
	owner, repoName, found := strings.Cut(repo.NameWithOwner, "/")
	if !found {
		fmt.Printf("  ⚠️ Warning: invalid repository name format %s\n", repo.NameWithOwner)
		return nil
	}

	specifications := map[string]any{}

	for _, release := range repo.Releases {
		folderPath := filepath.Join(cmd.specsFolder, "github.com", owner, repoName+"@"+release.TagName)
		connectorYamlPath := filepath.Join(folderPath, "connector.yaml")

		specs, err := cmd.readSpecs(connectorYamlPath)
		if err != nil {
			fmt.Printf("  ⚠️ Warning: could not load connector.yaml for %s@%s\n",
				owner+"/"+repoName, release.TagName)
			continue
		}

		specifications[release.TagName] = specs
		if release.IsLatest {
			specifications["latest"] = specs
		}
	}

	return specifications
}

func (*CommandDocs) readSpecs(path string) (map[string]any, error) {
	specsRaw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read specifications from %v: %w", path, err)
	}

	var data map[string]any
	err = yaml.Unmarshal(specsRaw, &data)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal specifications: %w", err)
	}
	return data, nil
}

func (cmd *CommandDocs) generateDocPage(
	index int,
	connectorName string,
	repo Repository,
	specifications map[string]any,
) error {
	path := filepath.Join(cmd.outputFolder, fmt.Sprintf("%v-%v.mdx", (index+1), connectorName))
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return fmt.Errorf("could not open file %s: %w", path, err)
	}
	defer f.Close()

	fmt.Printf("  💾 Writing %s ...\n", path)
	return util.Generate(util.GenerateOptions{
		Data: data{
			Repository:     repo,
			Specifications: specifications,
		},
		ReadmePath: "./connector-docs-mdx.tmpl",
		Out:        f,
		FuncMap:    funcMap,
	})
}

var funcMap = template.FuncMap{
	"formatParameterValueTable": formatParameterValueTable,
}

// formatParameterValue formats the value of a configuration parameter.
func formatParameterValueTable(value string) string {
	switch {
	case value == "":
		return `<Chip label="null" />`
	case strings.Contains(value, "\n"):
		// specifically used in the javascript processor
		return fmt.Sprintf("\n```js\n%s\n```\n", value)
	default:
		return fmt.Sprintf("`%s`", value)
	}
}
