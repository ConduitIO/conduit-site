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
	_ "embed"
	"errors"
	"fmt"
	"os"

	"github.com/gofri/go-github-ratelimit/github_ratelimit"
	"github.com/google/go-github/v67/github"
	"github.com/spf13/cobra"
)

func main() {
	cmdRoot := &cobra.Command{
		Use:   "connectorgen",
		Short: "Tooling around generating connector related files",
	}

	cmdRegistry := &cobra.Command{
		Use:   "registry",
		Short: "Discover connectors and create registry JSON",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			githubClient, err := githubClient()
			if err != nil {
				return err
			}

			outputPath := cmd.Flag("output-path").Value.String()

			return NewCommandRegistry(githubClient, outputPath).Execute(cmd.Context())
		},
	}
	cmdRegistry.Flags().StringP("output-path", "o", "./connectors.json", "path where the output file will be written")

	cmdSpecifications := &cobra.Command{
		Use:   "specifications",
		Short: "Download connector.yaml specifications for connectors",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			githubClient, err := githubClient()
			if err != nil {
				return err
			}

			connectorsPath := cmd.Flag("connectors").Value.String()
			outputPath := cmd.Flag("output").Value.String()

			return NewCommandSpecifications(githubClient, connectorsPath, outputPath, false).Execute(cmd.Context())
		},
	}
	cmdSpecifications.Flags().StringP("connectors", "c", "./connectors.json", "path to the connectors.json file")
	cmdSpecifications.Flags().StringP("output", "o", "./connectors", "path to the folder where the output files will be written")
	cmdSpecifications.Flags().BoolP("force", "f", false, "force fetching of connector.yaml even if it already exists")

	cmdPages := &cobra.Command{
		Use:   "pages",
		Short: "Generate static documentation pages for connectors",
		Args:  cobra.RangeArgs(0, 2),
		RunE: func(cmd *cobra.Command, args []string) error {
			connectorsPath := cmd.Flag("connectors").Value.String()
			specsPath := cmd.Flag("specs").Value.String()
			outputPath := cmd.Flag("output").Value.String()

			return NewCommandDocs(connectorsPath, specsPath, outputPath).Execute(cmd.Context())
		},
	}
	cmdPages.Flags().StringP("connectors", "c", "./connectors.json", "path to the connectors.json file")
	cmdPages.Flags().StringP("specs", "s", "./connectors", "path to the connector specifications folder")
	cmdPages.Flags().StringP("output", "o", "./docs", "path to the folder where the output files will be written")

	cmdRoot.AddCommand(
		cmdRegistry,
		cmdSpecifications,
		cmdPages,
	)
	cmdRoot.CompletionOptions.DisableDefaultCmd = true

	if err := cmdRoot.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		os.Exit(1)
	}
}

func githubClient() (*github.Client, error) {
	githubToken := os.Getenv("GITHUB_TOKEN")
	if githubToken == "" {
		return nil, errors.New("GITHUB_TOKEN environment variable not set")
	}

	rateLimiter, err := github_ratelimit.NewRateLimitWaiterClient(nil)
	if err != nil {
		return nil, fmt.Errorf("failed creating rate-limiting client: %w", err)
	}

	return github.NewClient(rateLimiter).WithAuthToken(githubToken), nil
}

func is404Error(err error) bool {
	var githubErr *github.ErrorResponse
	return errors.As(err, &githubErr) && githubErr.Response.StatusCode == 404
}
