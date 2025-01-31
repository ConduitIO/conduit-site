---
slug: '2024-10-15-pipelines-exit-on-degraded'
title: New pipelines.exit-on-degraded flag
draft: false
tags: [conduit, deprecate]
---

In this [latest release (Conduit 0.12)](/changelog/2024-10-10-conduit-0-12-0-release.md), we introduced a new flag named `pipelines.exit-on-degraded` that allows Conduit to exit if a pipeline enters a degraded state, while deprecating `pipelines.exit-on-error`. This change provides a more accurate description of the functionality.

<!--truncate-->

After Conduit 0.12, if you ran `conduit --help` in your terminal, you should see the new flag:

```bash
$ conduit --help
...
  -pipelines.exit-on-degraded:
      exit Conduit if a pipeline enters a degraded state
...
```

If you were using a [Conduit Configuration file](/docs/configuration#configuration-file) this should look like:

```yaml title="conduit.yaml"
# ...
pipelines:
  exit-on-degraded: true
# ...
```

Previously, this functionality was handled by `pipelines.exit-on-error`. However, with the introduction of [Pipeline Recovery](/docs/using/other-features/pipeline-recovery), the old description no longer accurately reflected the behavior, as a pipeline may not necessarily exit even in the presence of an error.

:::warning
The previous flag `pipelines.exit-on-error` will still be valid but is now hidden. We encourage all users to transition to `pipelines.exit-on-degraded` for improved clarity and functionality. 

Please note that `pipelines.exit-on-error` will eventually be removed in a future release.
:::

To ensure optimal performance and clarity in your configurations, please start using `pipelines.exit-on-degraded` in your configuration moving forward. If you have any questions, feel free to join our [Discord Community](https://discord.meroxa.com/).

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)