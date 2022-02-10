import React from "react";

export default function API() {
  return (
    <rapi-doc
      spec-url="https://raw.githubusercontent.com/ConduitIO/conduit/main/pkg/web/openapi/swagger-ui/api/v1/api.swagger.json"
      style={{ height: "100vh", width: "100%" }}
      schema-style="table"
      header-color="#2EBED8"
      regular-font="Inter"
      show-header="false"
      allow-try="false"
      show-info="false"
      allow-server-selection="false"
      allow-authentication="false"
      render-style="focused"
      theme="dark"
      primary-color="#2EBED8"
    >  <img
        slot="nav-logo"
        style={{"padding": "50px"}}
        src="https://www.conduit.io/images/conduit/conduit-logo.svg"
      /></rapi-doc>
  );
}
