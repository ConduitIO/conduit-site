import React from "react";
import Layout from "@theme/HomeLayout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "../components/HomepageFeatures";
import Connectors from "@theme/HomeLayout/Connectors";
import Navbar from '@theme/HomeLayout/NavBar';
import { MailIcon } from '@heroicons/react/solid'

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <rapi-doc
      spec-url = "https://raw.githubusercontent.com/ConduitIO/conduit/main/pkg/web/openapi/swagger-ui/api/v1/api.swagger.json"
      style={{height:"100vh", width:"100%"}}
    > </rapi-doc>
  );
}
