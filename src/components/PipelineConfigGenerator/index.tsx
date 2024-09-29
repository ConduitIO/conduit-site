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

export const SourceConnectors = ({url, setSourceYaml, isSource}) => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState(''); // Track selected value

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const connectors = data.filter(connector => isSource ? connector.source === "true" : connector.destination === "true");
        setConnectors(connectors);
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
          setSourceYaml(yamlData); 
        })
        .catch(err => console.error('Error fetching YAML:', err));
    }
    setSelectedValue(event.target.value);
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
        value={selectedValue} 
        onChange={handleConnectorChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px'}}
      >
        <option value="" disabled>Select a connector</option> {}
        {connectors.map((connector) => (
          <ConnectorItem key={connector.description} connector={connector} />
        ))}
      </select>
    </div>
  );
}

export const DestinationConnectors = ({url, setDestinationYaml, isSource}) => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState(''); // Track selected value

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const connectors = data.filter(connector => isSource ? connector.source === "true" : connector.destination === "true");
        setConnectors(connectors);
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
          setDestinationYaml(yamlData); 
        })
        .catch(err => console.error('Error fetching YAML:', err));
    }
    setSelectedValue(event.target.value);
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
        value={selectedValue} 
        onChange={handleConnectorChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px'}}
      >
        <option value="" disabled>Select a connector</option> {}
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
  const [destinationRawYaml, setDestinationYaml] = useState('foo');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [pipelineId, setPipelineId] = useState('source-to-destination');

  useEffect(() => {
    generateConfig();
  }, [pipelineId, sourceRawYaml, destinationRawYaml, sourceID, destinationID]);

  const sourceParsedYaml = yaml.load(sourceRawYaml); 
  const destinationParsedYaml = yaml.load(destinationRawYaml); 
  const sourceSettings = {};
  const destinationSettings = {};

  var sourceName, destinationName = '';
  
  // source
  if (sourceParsedYaml && sourceParsedYaml.sourceParams) {
    sourceParsedYaml.sourceParams.forEach(param => {
      if (param.default) {
        sourceSettings[param.name] = param.default;
      } else {
        sourceSettings[param.name] = '';
      }
    });
  }

  if (sourceParsedYaml.name) {
    sourceName = `source-${sourceParsedYaml.name}`;
  }

  // destination
  if (destinationParsedYaml && destinationParsedYaml.destinationParams) {
    destinationParsedYaml.destinationParams.forEach(param => {
      if (param.default) {
        destinationSettings[param.name] = param.default;
      } else {
        destinationSettings[param.name] = '';
      }
    });
  }

  if (destinationParsedYaml.name) {
    destinationName = `destination-${destinationParsedYaml.name}`;
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
              plugin: 'builtin:${destinationName}',
              settings: {
                ...destinationSettings,
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

      <SourceConnectors url={useBaseUrl('/connectors.json')} setSourceYaml={setSourceYaml} isSource={true}/>
      
      <h2>3. Choose your destination connector</h2>

      <DestinationConnectors url={useBaseUrl('/connectors.json')} setDestinationYaml={setDestinationYaml} isSource={false}/>

      <h2>4. Copy the generated pipeline configuration file</h2>

      {generatedConfig && (
        <div>
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
      <p>Now, you need to include this into your previously created file and start Conduit. You should seeing log lines saying that the pipeline <code>{pipelineId}</code> was created and ready to stream process:</p>
    </div>
  );
};

export default PipelineConfigGenerator;
