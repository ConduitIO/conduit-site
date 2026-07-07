// Copyright © 2026 Meroxa, Inc.
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

import "strings"

// The project no longer controls conduit.io; the site is served from
// conduitdata.io. Upstream connector READMEs and connector.yaml specs still
// hardcode conduit.io links, so generated output must be rewritten — otherwise a
// `make generate` would silently reintroduce dead links.
const (
	legacyDomain  = "conduit.io"
	currentDomain = "conduitdata.io"
)

// rewriteDomain replaces legacy conduit.io references with the current site
// domain in generated content. Safe because "conduit.io" is not a substring of
// "conduitdata.io" (no double-rewrite).
func rewriteDomain(b []byte) []byte {
	return []byte(strings.ReplaceAll(string(b), legacyDomain, currentDomain))
}
