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

interface ConnectorListProps {
  connectors: Connector[];
}

export const Connectors = ({url}) => {
  const [connectors, setConnectors] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.json() )
      .then(data => {
        setConnectors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

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
      <select style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px'}}>
        {connectors.map((connector) => (
          <ConnectorItem key={connector.description} connector={connector} />
        ))}
      </select>
    </div>
  );
}

const PipelineConfigGenerator: React.FC = () => {
  const [sourceFile, setSourceFile] = useState('example.in');
  const [destinationFile, setDestinationFile] = useState('example.out');
  const [pipelineStatus, setPipelineStatus] = useState('running');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [pipelineId, setPipelineId] = useState('source-to-destination');

  useEffect(() => {
    generateConfig();
  }, [pipelineId, sourceFile, destinationFile, pipelineStatus]);

  const generateConfig = () => {
    const config = {
      version: LATEST_VERSION,
      pipelines: [
        {
          id: pipelineId,
          status: pipelineStatus,
          description: `Example pipeline reading from file "${sourceFile}" and writing into file "${destinationFile}".`,
          connectors: [
            {
              id: sourceFile,
              type: 'source',
              plugin: 'builtin:file',
              settings: {
                path: `./${sourceFile}`,
              },
            },
            {
              id: destinationFile,
              type: 'destination',
              plugin: 'builtin:file',
              settings: {
                path: `./${destinationFile}`,
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

      {/* TODO: Filter out only the ones that are sources */}
      <Connectors url={useBaseUrl('/connectors.json')} />
      
      <h2>3. Choose your destination connector</h2>

      <p>TODO: Include a list of destination connectors here. Save which one is selected so it's sent to the react component.</p>

      <h2>4. Copy the generated pipeline configuration file</h2>

      <p>Customize your pipeline configuration by adjusting the following settings:</p>
      <label>
        Source File:
        <input
          type="text"
          value={sourceFile}
          onChange={(e) => setSourceFile(e.target.value)}
        />
      </label>
      <br />
      <label>
        Destination File:
        <input
          type="text"
          value={destinationFile}
          onChange={(e) => setDestinationFile(e.target.value)}
        />
      </label>
      <br />
      <label>
        Pipeline Status:
        <select value={pipelineStatus} onChange={(e) => setPipelineStatus(e.target.value)}>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
        </select>
      </label>
      <br />
      {generatedConfig && (
        <div style={{ position: 'relative' }}>
          <h4>Generated Configuration</h4>
          <p>Here's your generated pipeline configuration in YAML format:</p>
          <CodeBlock
            language="yaml"
            showLineNumbers >
            <div className="buttonGroup_node_modules-@docusaurus-theme-classic-lib-theme-CodeBlock-Content-styles-module">
              <CopyButton code={generatedConfig} />
            </div>
            {generatedConfig} 
          </CodeBlock>
        </div>
      )}
      <p>Now start Conduit. You should see a log line saying that the pipeline <code>{pipelineId}</code> was created:</p>
    </div>
  );
};

export default PipelineConfigGenerator;
