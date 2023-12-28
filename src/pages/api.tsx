import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

let Logo = require('@site/static/img/conduit/conduit-logo.svg').default;

export default function APIPage(): React.ReactElement {
  return (
    <BrowserOnly>
      {() => {
        require('rapidoc');
        return <rapi-doc
          spec-url="https://raw.githubusercontent.com/ConduitIO/conduit/main/pkg/web/openapi/swagger-ui/api/v1/api.swagger.json"
          render-style="focused"
          style={{height: "100vh", width: "100%"}}
          schema-style="table"
          show-header="false"
          allow-try="false"
          show-info="false"
          allow-server-selection="false"
          allow-authentication="false"
          theme="dark"
          primary-color="#2EBED8">
          <a href={"/"} slot="nav-logo"
             style={{"margin": "50px", "padding": "0"}}>
            <Logo style={{"width": "100%", "margin": "0 auto"}}/>
          </a>
        </rapi-doc>
      }}
    </BrowserOnly>
  )
}