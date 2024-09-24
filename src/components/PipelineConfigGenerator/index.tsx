import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import CodeBlock from '@theme/CodeBlock';
import CopyButton from '@theme/CodeBlock/CopyButton';



const PipelineConfigGenerator = () => {
  const [pipelineId, setPipelineId] = useState('file-to-file');
  const [sourceFile, setSourceFile] = useState('example.in');
  const [destinationFile, setDestinationFile] = useState('example.out');
  const [pipelineStatus, setPipelineStatus] = useState('running');
  const [generatedConfig, setGeneratedConfig] = useState('');

  useEffect(() => {
    generateConfig();
  }, [pipelineId, sourceFile, destinationFile, pipelineStatus]);

  const generateConfig = () => {
    const config = {
      version: '2.2',
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
      <label>
        Pipeline ID:
        <input
          type="text"
          value={pipelineId}
          onChange={(e) => setPipelineId(e.target.value)}
        />
      </label>
      <br />
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
    </div>
  );
};

export default PipelineConfigGenerator;
