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

import "testing"

func TestNewFilterExpr(t *testing.T) {
	tests := []struct {
		name        string
		filterStr   string
		shouldError bool
	}{
		{
			name:        "valid filter",
			filterStr:   "org/repo",
			shouldError: false,
		},
		{
			name:        "valid filter with wildcards",
			filterStr:   "org*/repo*",
			shouldError: false,
		},
		{
			name:        "missing repo",
			filterStr:   "org/",
			shouldError: true,
		},
		{
			name:        "missing org",
			filterStr:   "/repo",
			shouldError: true,
		},
		{
			name:        "no separator",
			filterStr:   "orgrepo",
			shouldError: true,
		},
		{
			name:        "empty string",
			filterStr:   "",
			shouldError: true,
		},
		{
			name:        "just a slash",
			filterStr:   "/",
			shouldError: true,
		},
		{
			name:        "spaces should be trimmed",
			filterStr:   "  org/repo  ",
			shouldError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := newFilterExpr(tt.filterStr)
			if (err != nil) != tt.shouldError {
				t.Errorf("newFilterExpr(%q) error = %v, shouldError %v", tt.filterStr, err, tt.shouldError)
			}
		})
	}
}

func TestFilterExprMatch(t *testing.T) {
	tests := []struct {
		name      string
		filterStr string
		matches   []struct {
			org      string
			repo     string
			expected bool
		}
	}{
		{
			name:      "exact match",
			filterStr: "kubernetes/kubernetes",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"kubernetes", "kubernetes", true},
				{"kubernetes", "k8s", false},
				{"k8s", "kubernetes", false},
				{"fookubernetes", "kubernetes", false},
				{"kubernetesfoo", "kubernetes", false},
				{"kubernetes", "fookubernetes", false},
				{"kubernetes", "kubernetesfoo", false},
			},
		},
		{
			name:      "org wildcard",
			filterStr: "kube*/kubernetes",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"kubernetes", "kubernetes", true},
				{"kubeflow", "kubernetes", true},
				{"kube", "kubernetes", true},
				{"k8s", "kubernetes", false},
			},
		},
		{
			name:      "repo wildcard",
			filterStr: "kubernetes/*flow",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"kubernetes", "kubeflow", true},
				{"kubernetes", "tensorflow", true},
				{"kubernetes", "flow", true},
				{"kubernetes", "kubernetes", false},
				{"k8s", "kubeflow", false},
			},
		},
		{
			name:      "both wildcards",
			filterStr: "kube*/*flow",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"kubernetes", "kubeflow", true},
				{"kubeflow", "tensorflow", true},
				{"kube", "flow", true},
				{"google", "tensorflow", false},
				{"kube", "test", false},
			},
		},
		{
			name:      "wildcard in middle",
			filterStr: "k*s/te*st",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"k8s", "test", true},
				{"kubernetes", "te-st", true},
				{"kbs", "terwest", true},
				{"kas", "test", true},
				{"k8s", "tst", false},
			},
		},
		{
			name:      "multiple wildcards",
			filterStr: "*hub/*-*",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"github", "test-repo", true},
				{"githubhub", "my-project", true},
				{"hub", "a-b", true},
				{"github", "repo", false},
				{"gitlab", "test-repo", false},
			},
		},
		{
			name:      "special regex characters",
			filterStr: "org.name/repo+name",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"org.name", "repo+name", true},
				{"orgxname", "repo+name", false},
				{"org.name", "reponame", false},
			},
		},
		{
			name:      "conduit use case",
			filterStr: "conduitio/conduit-connector-*",
			matches: []struct {
				org      string
				repo     string
				expected bool
			}{
				{"conduitio", "conduit-connector-file", true},
				{"ConduitIO", "conduit-connector-foo", true},
				{"conduitio", "conduit", false},
				{"conduitio", "streaming-benchmarks", false},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter, err := newFilterExpr(tt.filterStr)
			if err != nil {
				t.Fatalf("Failed to create filter expression: %v", err)
			}

			for _, m := range tt.matches {
				got := filter.Match(m.org, m.repo)
				if got != m.expected {
					t.Errorf("filter %q.Match(%q, %q) = %v, want %v",
						tt.filterStr, m.org, m.repo, got, m.expected)
				}
			}
		})
	}
}
