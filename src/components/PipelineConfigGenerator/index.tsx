import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import CodeBlock from '@theme/CodeBlock';
import CopyButton from '@theme/CodeBlock/CopyButton';
import useBaseUrl from '@docusaurus/useBaseUrl';

// TODO: Define latest version globally somewhere in the project so we can use it everywhere
const LATEST_VERSION = '2.2';
export class Connector {
  nameWithOwner: string;
  description: string;
  specificationPath: string;
}

export interface ConnectorItemProps {
  connector: Connector;
}

const ConnectorItem: React.FC<ConnectorItemProps> = (props) => (
  <option value={props.connector.description}>{props.connector.nameWithOwner}</option>
);

export const Connectors = ({url, setSourceYaml}) => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState(''); // Track selected value

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const sourceConnectors = data.filter(connector => connector.source === "true");
        setConnectors(sourceConnectors);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleConnectorChange = (event) => {
    const selectedConnector = connectors.find(connector => connector.description === event.target.value);
    if (selectedConnector) {
      fetch(selectedConnector.specificationPath)
        .then(response => response.text())
        .then(yamlData => {
          setSourceYaml(yamlData); // Update sourceRawYaml state with the extracted path
          // You can also set other settings if needed
        })
        .catch(err => console.error('Error fetching YAML:', err));
    }
    setSelectedValue(event.target.value); // Update selected value
  };

  if (loading) {
    return <p>Loading connectors...</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      overflow: 'auto',
      maxHeight: '200px',
    }}>
      <select 
        value={selectedValue} // Set the value of the select
        onChange={handleConnectorChange} // Add onChange handler
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px'}}
      >
        <option value="" disabled>Select a connector</option> {/* Hidden option */}
        {connectors.map((connector) => (
          <ConnectorItem key={connector.description} connector={connector} />
        ))}
      </select>
    </div>
  );
}

const PipelineConfigGenerator: React.FC = () => {
  const [sourceID, setSourceID] = useState('source-id');
  const [destinationID, setDestinationID] = useState('destination-id');
  const [sourceRawYaml, setSourceYaml] = useState('foo');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [pipelineId, setPipelineId] = useState('source-to-destination');

  useEffect(() => {
    generateConfig();
  }, [pipelineId, sourceRawYaml, destinationID]);

  const sourceParsedYaml = yaml.load(sourceRawYaml); 
  const sourceSettings = {};

  var sourceName = '';
  
  if (sourceParsedYaml && sourceParsedYaml.sourceParams) {
    sourceParsedYaml.sourceParams.forEach(param => {
      if (param.default) {
        sourceSettings[param.name] = param.default;
      } else {
        sourceSettings[param.name] = '';
      }
    });
  }

  debugger;
  if (sourceParsedYaml.name) {
    sourceName = sourceParsedYaml.name;
  }

  const generateConfig = () => {
    const config = {
      version: LATEST_VERSION,
      pipelines: [
        {
          id: pipelineId,
          status: 'running',
          description: `Pipeline example reading from "${sourceID}",
and writing to "${destinationID}".`,
          connectors: [
            {
              id: sourceID,
              type: 'source',
              // We're assuming the list of source connectors always are builtin for easier usage.
              plugin: `builtin:${sourceName}`,
              settings: {
                ...sourceSettings,
              },
            },
            {
              id: destinationID,
              type: 'destination',
              plugin: 'builtin:file',
              settings: {
                path: `./${destinationID}`,
                'sdk.record.format': 'template',
                'sdk.record.format.options': '{{ printf "%s" .Payload.After }}',
              },
            },
          ],
        },
      ],
    };

    const yamlStr = yaml.dump(config);
    setGeneratedConfig(yamlStr);
  };

  return (
    <div>
      <h2>1. Give your pipeline an ID</h2>

      <p>Your pipeline ID is the unique identifier for your pipeline. It's used to distinguish your pipeline from other pipelines in the system. It must be unique within your pipeline configuration file.</p>

      <div style={{
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <input
          id="pipelineId"
          type="text"
          value={pipelineId}
          onChange={(e) => setPipelineId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            boxSizing: 'border-box',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: 'white'
          }}
          placeholder="e.g., my-first-pipeline"
        />
      </div>

      <h2>2. Choose your source connector</h2>

      <Connectors url={useBaseUrl('/connectors.json')} setSourceYaml={setSourceYaml} />
      
      <h2>3. Choose your destination connector</h2>

      <p>TODO: Include a list of destination connectors here. Save which one is selected so it's sent to the react component.</p>

      <h2>4. Copy the generated pipeline configuration file</h2>

      <br />
      {generatedConfig && (
        <div>
          <h4>Generated Configuration</h4>
          <p>Here's your generated pipeline configuration in YAML format:</p>
          <div style={{ position: 'relative' }}>
          <CodeBlock
            language="yaml"
            showLineNumbers>
            <div className="buttonGroup_node_modules-@docusaurus-theme-classic-lib-theme-CodeBlock-Content-styles-module" >
              <CopyButton code={generatedConfig} />
            </div>
            {generatedConfig} 
          </CodeBlock>
          </div>
        </div>
      )}
      <p>Now start Conduit. You should see a log line saying that the pipeline <code>{pipelineId}</code> was created:</p>
    </div>
  );
};

export default PipelineConfigGenerator;
