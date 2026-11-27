#!/usr/bin/env python3
"""Point the site's "current Conduit version" slots at a release.

WHY: the install page, the quickstart guide and the announcement bar all name a
specific Conduit version, and they were last bumped by hand for v0.20.5 — two
minor releases behind by the time anyone noticed. The front page told visitors
to upgrade to a version three releases old. A release is cut monthly, so the
bump has to happen without anyone remembering to do it.

WHAT IT DOES NOT DO: a blanket search and replace over `v0.NN.N` would rewrite
sentences that are statements of history, not statements of what is current --
"From v0.20.0, release archives carry a checksum" and "Building Conduit v0.20.0
or later from source requires Go 1.26" are both true and both must keep saying
v0.20.0 forever. So every rewrite below is anchored to the syntax around it: a
`TAG=` assignment, an extracted directory, Conduit's own startup banner, a
download filename. A version that is not in one of those shapes is left alone,
and test_sync_conduit_version.py asserts exactly that.

The announcement bar is rewritten wholesale into a neutral sentence rather than
having its version patched, because its prose is about a particular release
("fixes record copies sharing nested data") and patching the number through
would leave a confident false statement on the front page. A reviewer who wants
editorial emphasis adds it in the pull request; it will be replaced again at the
next release, which is correct, since the bar is always about the newest one.

Usage:
  sync_conduit_version.py --version v0.22.0 [--root .] [--check]
  sync_conduit_version.py [--root .] [--check]      # asks GitHub for the latest

`--check` writes nothing and exits 1 if anything is out of date, so CI can ask
the question without changing the tree.
"""

import argparse
import json
import os
import re
import subprocess
import sys

VERSION_RE = re.compile(r"^v(\d+)\.(\d+)\.(\d+)$")


def normalise(version):
    """`v0.22.0` from `0.22.0` or `v0.22.0`; rejects anything else.

    A pre-release (`v0.23.0-nightly.20261127`) is rejected on purpose: the site
    documents the stable release, and a nightly reaching these slots would tell
    every visitor to install a nightly.
    """
    v = version.strip()
    if not v.startswith("v"):
        v = "v" + v
    if not VERSION_RE.match(v):
        raise ValueError(f"not a stable Conduit version: {version!r}")
    return v


def latest_release():
    """The latest stable release of ConduitIO/conduit, per `gh`.

    `gh release view` with no tag returns the release marked Latest, which
    GitHub never sets to a pre-release, so nightlies cannot win here.
    """
    out = subprocess.run(
        ["gh", "release", "view", "--repo", "ConduitIO/conduit", "--json", "tagName"],
        capture_output=True, text=True, check=True).stdout
    return normalise(json.loads(out)["tagName"])


# Each rule is (relative path, compiled pattern, replacement template). The
# pattern must capture the version and nothing else, so the anchoring text is
# rebuilt verbatim. `{v}` is `v0.22.0`, `{n}` is `0.22.0`, `{d}` is `0-22-0`.
def rules():
    return [
        # `$ TAG=v0.20.5; curl -o conduit.tar.gz -L .../tags/$TAG.tar.gz`
        ("docs/1-using/0-installing-and-running.mdx",
         re.compile(r"(TAG=)v\d+\.\d+\.\d+(;)"), r"\g<1>{v}\g<2>"),
        # `$ cd conduit-0.20.5`
        ("docs/1-using/0-installing-and-running.mdx",
         re.compile(r"(cd conduit-)\d+\.\d+\.\d+\b"), r"\g<1>{n}"),
        # `conduit_0.20.0_Windows_x86_64.zip` — the file a reader just downloaded.
        ("docs/1-using/0-installing-and-running.mdx",
         re.compile(r"(conduit_)\d+\.\d+\.\d+(_[A-Za-z0-9]+_[A-Za-z0-9_]+\.(?:zip|tar\.gz))"),
         r"\g<1>{n}\g<2>"),
        # Conduit's own startup banner, quoted as sample output.
        ("docs/1-using/0-installing-and-running.mdx",
         re.compile(r"(Conduit v)\d+\.\d+\.\d+( \S+/\S+)"), r"\g<1>{n}\g<2>"),
        ("docs/1-using/8-guides/build-generator-to-log-pipeline.mdx",
         re.compile(r"(Conduit v)\d+\.\d+\.\d+( \S+/\S+)"), r"\g<1>{n}\g<2>"),
    ]


BAR_ID = re.compile(r"(announcementBar:\s*\{\s*\n\s*id: ')[^']*(')")
BAR_CONTENT = re.compile(r"(\n(\s*)content: `)[^`]*(`,\n)")


def bar_text(version, link):
    return (f"Conduit {version} is out. "
            f"<a class='cta' href='{link}' target='_blank' rel='noreferrer noopener'>"
            f"Read the release post</a>.")


def changelog_link(root, version):
    """The changelog post for this release, or the GitHub release when there is
    none yet. Returns (href, post_exists). The automation cannot write the post
    -- release prose is not something to generate -- so it links to the release
    notes and says the post is missing, and picks the post up once it lands."""
    dashed = version.lstrip("v").replace(".", "-")
    d = os.path.join(root, "changelog")
    if os.path.isdir(d):
        for name in sorted(os.listdir(d)):
            if name.endswith(f"-conduit-{dashed}-release.mdx"):
                return "/changelog/" + name[: -len(".mdx")], True
    return f"https://github.com/ConduitIO/conduit/releases/tag/{version}", False


def apply_to_text(text, version, pats):
    """Apply (pattern, replacement) pairs; returns the new text."""
    n, d = version.lstrip("v"), version.lstrip("v").replace(".", "-")
    for pat, repl in pats:
        text = pat.sub(repl.format(v=version, n=n, d=d), text)
    return text


def sync(root, version, check=False):
    """Rewrite every slot. Returns (changed paths, notes)."""
    version = normalise(version)
    changed, notes = [], []

    by_file = {}
    for path, pat, repl in rules():
        by_file.setdefault(path, []).append((pat, repl))

    for path, pats in by_file.items():
        full = os.path.join(root, path)
        if not os.path.exists(full):
            notes.append(f"{path}: missing, so its version slots were not checked")
            continue
        with open(full) as f:
            before = f.read()
        after = apply_to_text(before, version, pats)
        if after != before:
            changed.append(path)
            if not check:
                with open(full, "w") as f:
                    f.write(after)

    cfg = os.path.join(root, "docusaurus.config.ts")
    if os.path.exists(cfg):
        with open(cfg) as f:
            before = f.read()
        link, has_post = changelog_link(root, version)
        if not has_post:
            notes.append(f"changelog: no post for {version}; the bar links to the release notes "
                         f"instead. Add changelog/<date>-conduit-"
                         f"{version.lstrip('v').replace('.', '-')}-release.mdx and this becomes a "
                         f"link to it.")
        after = BAR_ID.sub(r"\g<1>announcement-bar-" + version.lstrip("v").replace(".", "-") + r"\g<2>", before)
        # The id has to change or Docusaurus keeps the bar hidden for everyone
        # who dismissed the previous one.
        after = BAR_CONTENT.sub(lambda m: m.group(1) + bar_text(version, link) + m.group(3), after, count=1)
        if after != before:
            changed.append("docusaurus.config.ts")
            if not check:
                with open(cfg, "w") as f:
                    f.write(after)
    else:
        notes.append("docusaurus.config.ts: missing, so the announcement bar was not checked")

    return changed, notes


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", help="stable release to point at (default: ask GitHub)")
    ap.add_argument("--root", default=".", help="site checkout (default: .)")
    ap.add_argument("--check", action="store_true", help="report drift, write nothing, exit 1 if any")
    a = ap.parse_args(argv)
    try:
        version = normalise(a.version) if a.version else latest_release()
    except (ValueError, subprocess.CalledProcessError, KeyError, json.JSONDecodeError) as e:
        print(f"cannot determine the version to sync: {e}", file=sys.stderr)
        return 2
    changed, notes = sync(a.root, version, check=a.check)
    for n in notes:
        print(f"note: {n}")
    if not changed:
        print(f"up to date at {version}")
        return 0
    verb = "out of date" if a.check else "updated"
    print(f"{verb} for {version}: " + ", ".join(sorted(set(changed))))
    return 1 if a.check else 0


if __name__ == "__main__":
    sys.exit(main())
