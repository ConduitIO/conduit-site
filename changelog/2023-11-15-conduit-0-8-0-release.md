---
slug: '2023-11-15-conduit-0-8-0-release'
title: Conduit 0.8.0 release
draft: false
tags: [conduit, release, conduit-release]
---


We're excited to announce a new release of [**Conduit v0.8**](https://github.com/ConduitIO/conduit/releases/tag/v0.8.0)! This update prioritizes performance enhancements, aiming to establish Conduit as the default tool for data movement. 

<!--truncate-->

### Key Highlights

- **Performance Boost**: We’ve achieved a performance increase of over 2.5x, reaching nearly 70k messages per second through a single Kafka-to-Kafka pipeline. This improvement results from optimizations in the core of Conduit and enhancements to our Kafka Connector.

### Future Work

While we've made significant strides in performance, we are exploring further improvements, particularly in **micro-batching**. This technique combines multiple records into a single batch for processing, allowing us to push nearly 250k messages per second through a single pipeline. This experimental work demonstrates the potential for even greater performance gains.

For those interested, the experimental micro-batching work is available in a branch of the Conduit repository.

:::tip
For an in-depth look at the new features and improvements in Conduit v0.8, check out our [blog post](https://meroxa.com/blog/conduit-0.8-is-here/).
:::

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)