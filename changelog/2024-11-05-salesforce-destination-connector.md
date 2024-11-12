---
slug: '2024-11-05-salesforce-destination-connector'
title: New Salesforce destination connector
draft: false
tags: [conduit, connector, salesforce]
---

We're happy to announce a new **Salesforce Destination Connector 0.5** for Conduit on [`v0.5.0`](https://github.com/conduitio-labs/conduit-connector-salesforce/releases/tag/v0.5.0), featuring real-time data integration with Salesforce Platform Events. This release enhances your ability to publish records directly to Salesforce, leveraging the power of Platform Events for seamless real-time communication between systems.

<!--truncate-->

### Key Highlights

-  **Real-Time Data Publishing**: The Destination connector now supports publishing incoming records to Salesforce Platform Events in real-time, enabling efficient asynchronous communication and data exchange.
-  **PubSub API Integration**: Utilizes Salesforce's PubSub API for subscribing to event data, ensuring reliable and scalable event-driven architecture.
-  **Custom Platform Events**: Listen to and publish custom Platform Events tailored to your specific use cases, as well as subscribe to existing events within Salesforce.
-  **OAuth Authentication**: Securely authenticate with Salesforce using OAuth credentials, ensuring safe and authorized access to your Salesforce data.

:::tip
For detailed instructions on setting up and using the new Destination feature, refer to our [documentation](https://github.com/conduitio-labs/conduit-connector-salesforce#destination).
:::

This release marks a significant step towards enhancing the integration capabilities of the Conduit Salesforce Connector, providing a robust solution for real-time data synchronization with Salesforce.

![scarf pixel conduit-site-changelog](https://static.scarf.sh/a.png?x-pxid=b43cda70-9a98-4938-8857-471cc05e99c5)
