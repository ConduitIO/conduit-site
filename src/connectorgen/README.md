# ConnectorGen

This is a simple tool to generate the list of Conduit connectors that can be
found on GitHub. It works by fetching all dependents of the Conduit Connector
SDK and then adding information about the connector (found in the repository),
the available releases, etc.

The repositories are sorted by URL, making it possible to more easily review the
changes.

# Usage

## GitHub workflow

A GitHub workflow that automatically generates the list once a week and opens a
pull request with the changes is defined
in [update-connectors-list.yaml](/.github/workflows/update-connectors-list.yaml)

## Manual

Assuming that [gh](https://cli.github.com/) is installed, `connectorgen` can be invoked in the following
way:

```shell
GITHUB_TOKEN=$(gh auth token) make generate 
```

# Future work

* Automatically approve the PR (if the changes are safe)
