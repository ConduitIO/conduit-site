#!/usr/bin/env python3
"""Tests for sync_conduit_version.py.

The one that matters is test_history_is_left_alone: the reason this script has
anchored patterns instead of a search and replace is that the install page makes
statements about the past, and a bump that rewrote them would put confident
false claims into the docs with nothing to catch it.
"""

import os
import re
import shutil
import tempfile
import unittest

import sync_conduit_version as s

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, ".."))

INSTALL = "docs/1-using/0-installing-and-running.mdx"
GUIDE = "docs/1-using/8-guides/build-generator-to-log-pipeline.mdx"
CONFIG = "docusaurus.config.ts"

INSTALL_FIXTURE = """\
From v0.20.0, release archives carry a checksum.

Let's say you downloaded `conduit_0.20.0_Windows_x86_64.zip`.

```
tar -xf conduit_0.20.0_Windows_x86_64.zip
```

Building Conduit v0.20.0 or later from source requires Go 1.26 or newer.

```
$ TAG=v0.20.5; curl -o conduit.tar.gz -L https://github.com/ConduitIO/conduit/archive/refs/tags/$TAG.tar.gz
$ cd conduit-0.20.5
```

```
         `::::::::::‘        Conduit v0.20.5 linux/amd64
```
"""

GUIDE_FIXTURE = "         `::::::::::‘        Conduit v0.20.5 linux/amd64\n"

CONFIG_FIXTURE = """\
    announcementBar: {
      id: 'announcement-bar-20-5', // increment on change
      content: `Conduit v0.20.5 fixes record copies and two Avro bugs. <a class='cta' href='/changelog/2026-10-20-conduit-0-20-5-release' target='_blank' rel='noreferrer noopener'>Read the release post</a>.`,
      isCloseable: true,
    },
"""


def tree(d, install=INSTALL_FIXTURE, guide=GUIDE_FIXTURE, config=CONFIG_FIXTURE, posts=()):
    for rel, body in ((INSTALL, install), (GUIDE, guide), (CONFIG, config)):
        if body is None:
            continue
        p = os.path.join(d, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w") as f:
            f.write(body)
    os.makedirs(os.path.join(d, "changelog"), exist_ok=True)
    for name in posts:
        with open(os.path.join(d, "changelog", name), "w") as f:
            f.write("---\nslug: x\n---\n")
    return d


def read(d, rel):
    with open(os.path.join(d, rel)) as f:
        return f.read()


class Normalise(unittest.TestCase):
    def test_accepts_both_spellings(self):
        self.assertEqual(s.normalise("v0.22.0"), "v0.22.0")
        self.assertEqual(s.normalise("0.22.0"), "v0.22.0")
        self.assertEqual(s.normalise(" v0.22.0 "), "v0.22.0")

    def test_rejects_a_prerelease(self):
        # A nightly reaching these slots would tell every visitor to install a
        # nightly, so it is refused rather than normalised.
        for bad in ("v0.23.0-nightly.20261127", "v0.22", "0.22.0.1", "latest", "", "v0.22.0+x"):
            with self.assertRaises(ValueError, msg=bad):
                s.normalise(bad)


class Slots(unittest.TestCase):
    def test_the_current_version_slots_are_bumped(self):
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            changed, _ = s.sync(d, "v0.22.0")
            self.assertIn(INSTALL, changed)
            t = read(d, INSTALL)
            self.assertIn("TAG=v0.22.0;", t)
            self.assertIn("cd conduit-0.22.0", t)
            self.assertIn("conduit_0.22.0_Windows_x86_64.zip", t)
            self.assertIn("Conduit v0.22.0 linux/amd64", t)
            self.assertIn("Conduit v0.22.0 linux/amd64", read(d, GUIDE))

    def test_history_is_left_alone(self):
        # The whole reason the patterns are anchored. These two sentences are
        # true about v0.20.0 and stay true; a bump that moved them would be a
        # silent lie in the install docs.
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            s.sync(d, "v0.22.0")
            t = read(d, INSTALL)
            self.assertIn("From v0.20.0, release archives carry a checksum.", t)
            self.assertIn("Building Conduit v0.20.0 or later from source requires Go 1.26", t)
            self.assertNotIn("From v0.22.0", t)
            self.assertNotIn("Building Conduit v0.22.0 or later", t)

    def test_running_twice_changes_nothing_the_second_time(self):
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            s.sync(d, "v0.22.0")
            after = read(d, INSTALL)
            changed, _ = s.sync(d, "v0.22.0")
            self.assertEqual(changed, [])
            self.assertEqual(read(d, INSTALL), after)

    def test_check_mode_writes_nothing_and_reports(self):
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            before = read(d, INSTALL)
            changed, _ = s.sync(d, "v0.22.0", check=True)
            self.assertIn(INSTALL, changed)
            self.assertEqual(read(d, INSTALL), before)

    def test_a_missing_file_is_reported_not_crashed_on(self):
        # The site is reorganised from time to time; a moved page must make the
        # job say so, not traceback and leave the rest unbumped.
        with tempfile.TemporaryDirectory() as d:
            tree(d, guide=None)
            changed, notes = s.sync(d, "v0.22.0")
            self.assertIn(INSTALL, changed)
            self.assertTrue(any(GUIDE in n and "missing" in n for n in notes))


class AnnouncementBar(unittest.TestCase):
    def test_the_bar_is_rewritten_and_its_id_bumped(self):
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            s.sync(d, "v0.22.0")
            t = read(d, CONFIG)
            self.assertIn("id: 'announcement-bar-0-22-0'", t)
            self.assertIn("Conduit v0.22.0 is out.", t)
            # The old release-specific prose is gone rather than renumbered: it
            # described v0.20.5's fixes and would be false about v0.22.0.
            self.assertNotIn("record copies", t)
            self.assertNotIn("v0.20.5", t)
            self.assertIn("isCloseable: true", t)

    def test_the_bar_links_to_the_changelog_post_when_there_is_one(self):
        with tempfile.TemporaryDirectory() as d:
            tree(d, posts=("2026-11-25-conduit-0-22-0-release.mdx",))
            _, notes = s.sync(d, "v0.22.0")
            self.assertIn("href='/changelog/2026-11-25-conduit-0-22-0-release'", read(d, CONFIG))
            self.assertFalse([n for n in notes if "no post" in n])

    def test_without_a_post_it_links_to_the_release_and_says_so(self):
        # Release prose is not something to generate, so the job reports the gap
        # instead of inventing a post, and picks the post up once it lands.
        with tempfile.TemporaryDirectory() as d:
            tree(d)
            _, notes = s.sync(d, "v0.22.0")
            self.assertIn("href='https://github.com/ConduitIO/conduit/releases/tag/v0.22.0'",
                          read(d, CONFIG))
            self.assertTrue(any("no post for v0.22.0" in n for n in notes))


class LiveSite(unittest.TestCase):
    """Against the real checkout, so a page that moves is caught here."""

    def test_every_rule_matches_something_in_the_real_site(self):
        # A rule that matches nothing is a slot that silently stopped being
        # maintained -- the failure this script exists to prevent.
        for path, pat, _ in s.rules():
            full = os.path.join(SITE, path)
            self.assertTrue(os.path.exists(full), f"{path} does not exist")
            with open(full) as f:
                self.assertRegex(f.read(), pat, f"{path}: {pat.pattern} matches nothing")

    def test_the_real_config_has_a_bar_this_script_can_rewrite(self):
        with open(os.path.join(SITE, CONFIG)) as f:
            text = f.read()
        self.assertRegex(text, s.BAR_ID)
        self.assertRegex(text, s.BAR_CONTENT)

    def test_the_real_site_is_in_sync_with_its_newest_changelog_post(self):
        # Not "in sync with the latest release": that needs the network. This
        # asserts the committed tree is self-consistent, which is what a
        # reviewer of an automated bump PR is checking.
        # Only the canonical `...-conduit-0-22-0-release.mdx` shape: the
        # changelog also holds variants such as
        # `2026-10-24-conduit-0-21-0-security-release.mdx`, and a connector's
        # own posts, neither of which names the site's current version.
        canonical = re.compile(r"^\d{4}-\d{2}-\d{2}-conduit-(\d+)-(\d+)-(\d+)-release\.mdx$")
        found = [(tuple(int(x) for x in m.groups()), m)
                 for m in (canonical.match(n) for n in os.listdir(os.path.join(SITE, "changelog")))
                 if m]
        self.assertTrue(found, "no canonical conduit release post in changelog/")
        (major, minor, patch), _ = max(found)
        version = f"v{major}.{minor}.{patch}"
        with tempfile.TemporaryDirectory() as d:
            shutil.copytree(SITE, os.path.join(d, "site"),
                            ignore=shutil.ignore_patterns("node_modules", ".git", "build", ".docusaurus"))
            changed, _ = s.sync(os.path.join(d, "site"), version, check=True)
            self.assertEqual(changed, [], f"the site does not point at {version}: {changed}")


if __name__ == "__main__":
    unittest.main()
