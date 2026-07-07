package main

import "testing"

func TestRewriteDomain(t *testing.T) {
	cases := map[string]string{
		"see https://conduit.io/docs/x":      "see https://conduitdata.io/docs/x",
		"curl https://conduit.io/install.sh": "curl https://conduitdata.io/install.sh",
		"no domain here":                     "no domain here",
		// already-current domain must not be double-rewritten
		"https://conduitdata.io/docs": "https://conduitdata.io/docs",
	}
	for in, want := range cases {
		if got := string(rewriteDomain([]byte(in))); got != want {
			t.Errorf("rewriteDomain(%q) = %q, want %q", in, got, want)
		}
	}
}
