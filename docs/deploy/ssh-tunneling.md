---
title: SSH Tunneling
description: SSH tunneling is a networking feature that allows Meroxa to communicate to resources that are not publicly available over the Internet.
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# SSH Tunneling

SSH tunneling is a networking feature that allows Meroxa to communicate to resources that are not publicly available over the Internet.

<img alt="Meroxa SSH Tunneling Diagram" src="/images/docs/networking/meroxa-ssh-tunneling-diagram.png" />

## Creating a resource with an SSH Tunnel

<Tabs
defaultValue="cli"
values={[
{label: 'CLI', value: 'cli'},
{label: 'Dashboard', value: 'dashboard'},
]}>
<TabItem value="dashboard">

_SSH tunneling cannot be enabled on an existing resource; you must [create a new resource](/docs/networking/ssh-tunneling#creating-a-resource-with-an-ssh-tunnel)._

On the bottom of the form to create a resource, you can find the section to add an SSH tunnel to the resource.

<img src="/images/docs/networking/ssh-tunnel-creation.png" style={{"width":"75%"}} />

This will need to be a valid URL beginning with `ssh://` in order to connect to your [bastion host](#creating-a-bastion-host).

</TabItem>
<TabItem value="cli">

_SSH tunneling cannot be enabled on an existing resource; you must [create a new resource](/docs/networking/ssh-tunneling#creating-a-resource-with-an-ssh-tunnel)._

To [create a resource](/docs/pipelines/resources#adding-resources) with SSH Tunneling via the CLI:

1. Whitelist [Meroxa IP addresses](https://docs.meroxa.com/docs/networking/meroxa-ips) on your bastion host.

2. Use the `meroxa resource create` command and provide the [--ssh-url](/cli/cmd/meroxa-resources-create) option:

```
--ssh-url $BASTION_URL
```

Replace `$BASTION_URL` with the URL of your [bastion host](#creating-a-bastion-host). For example:

```
$ meroxa resource create tunnel324
  --type postgres \
  --url postgres://user:password@example.com:5432/dbname \
  --ssh-url ssh://ssh-tunnel-test@tunnel-test@example.elb.us-east-1.amazonaws.com:5432

Resource "tunnel324" is successfully created but is pending for validation! Paste the following public key on your host:
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC8vC5gN+f1cnYXE5ZTTzijSTVzH/sxA7fMaOY8hIudBNYUBk8dHkj9DQjdz+ecqUltNm/QsMkxCpcg0U279ZLcZ3hTSVfgs3I7aLPV
=> Meroxa will try to connect to host for 60 minutes and send email confirmation of resource creation
```

3. Step 2 will return a Public key which you will then need to use on your bastion host to validate the connection to your resource. Meroxa will attempt to connect to your resource for 60 minutes and will send a confirmation email after establishing a connection.

</TabItem>
</Tabs>

## Validate Tunnel Connection

After creating your resource with SSH Tunneling, if you have not added the SSH key to your bastion host **within 60 minutes**, you will need to validate your resource manually.

<Tabs
defaultValue="cli"
values={[
{label: 'CLI', value: 'cli'},
{label: 'Dashboard', value: 'dashboard'},
]}>
<TabItem value="dashboard">

On the Resources list page, click the action icon next to your resource in order to open up the menu. Click the link to validate the connection.

<img src="/images/docs/networking/ssh-tunnel-list-view.png" />

And then copy the SSH key to your bastion host.

<img src="/images/docs/networking/copy-ssh-key.png" />

</TabItem>
<TabItem value="cli">

```
$ meroxa resources validate $RESOURCE_NAME
```

This command is also useful in case something changes on your remote server, such as a database password was updated.
</TabItem>
</Tabs>

## Rotating SSH Keys

In some cases, such as a company policy or a general security practice, you may need to rotate the SSH key used to validate the resource connection.

<Tabs
defaultValue="cli"
values={[
{label: 'CLI', value: 'cli'},
{label: 'Dashboard', value: 'dashboard'},
]}>
<TabItem value="dashboard">

On the Resources list page, click the action icon next to your resource in order to open up the menu. Click the link to rotate your key.

<img src="/images/docs/networking/ssh-tunnel-list-view.png" />

A confirmation modal will pop up. As soon as you rotate your key, this will interrupt the connection to your resource until you update the key on your bastion host. We recommend pausing your pipeline during this time.

<img src="/images/docs/networking/ssh-tunnel-rotate-confirm.png" />

And then copy the SSH key to your bastion host.

<img src="/images/docs/networking/copy-ssh-key.png" />

</TabItem>
<TabItem value="cli">

You can can rotate keys with the following command:

```
$ meroxa resources rotate-tunnel-key $RESOURCE_NAME
```

This will return a new SSH key. Meroxa will try to connect to the bastion host for 60 minutes. If it cannot connect, you will need to validate the connection again.

</TabItem>
</Tabs>

:::caution

When you rotate your key, it will immediately affect the connection to the bastion host, so we recommend that you pause your pipeline before proceeding.

:::

:::note

You will have 60 minutes to update the new key on your bastion host or you will need to revalidate the connection again.

:::

## Creating a Bastion Host

To enable SSH Tunneling, you will need a [bastion host](https://en.wikipedia.org/wiki/Bastion_host) within your infrastructure.

Here are resources to help you create a host within the various infrastructure providers:

- [Google Cloud Platform](https://cloud.google.com/solutions/connecting-securely#bastion)
- [Amazon Web Services](https://aws.amazon.com/quickstart/architecture/linux-bastion/)
- [Microsoft Azure](https://docs.microsoft.com/en-us/azure/bastion/tutorial-create-host-portal)
