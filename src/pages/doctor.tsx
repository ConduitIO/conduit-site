import React, { useEffect, useState } from 'react';

interface Version {
  currentVersion: string;
  usingLatest: boolean;
}

interface WorkflowChecks {
  [key: string]: boolean;
}

interface Repository {
  nameWithOwner: string;
  url: string;
  toolsGoIsCorrect: boolean;
  makefileIsCorrect: boolean;
  goVersion: Version;
  connectorSDKVersion: Version;
  conduitCommonsVersion: Version;
  hasScarfPixel: boolean;
  workflowChecks: WorkflowChecks;
}

const ConnectorTable: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/connectors.json')
      .then(response => response.json())
      .then(data => {
        setRepositories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (column: string) => {
    const direction = sortedColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortedColumn(column);
    setSortDirection(direction);

    const sortedData = [...repositories].sort((a, b) => {
      let compareA, compareB;

      switch (column) {
        case 'nameWithOwner':
          compareA = a.nameWithOwner.toLowerCase();
          compareB = b.nameWithOwner.toLowerCase();
          break;
        case 'toolsGoIsCorrect':
        case 'makefileIsCorrect':
        case 'hasScarfPixel':
          compareA = a[column] ? 1 : 0;
          compareB = b[column] ? 1 : 0;
          break;
        case 'goVersion':
          compareA = a.goVersion.currentVersion;
          compareB = b.goVersion.currentVersion;
          break;
        case 'connectorSDKVersion':
          compareA = a.connectorSDKVersion.currentVersion;
          compareB = b.connectorSDKVersion.currentVersion;
          break;
        case 'connectorSDKVersionLatest':
          compareA = a.connectorSDKVersion.usingLatest ? 1 : 0;
          compareB = b.connectorSDKVersion.usingLatest ? 1 : 0;
          break;
        case 'conduitCommonsVersion':
          compareA = a.conduitCommonsVersion.currentVersion;
          compareB = b.conduitCommonsVersion.currentVersion;
          break;
        case 'conduitCommonsVersionLatest':
          compareA = a.conduitCommonsVersion.usingLatest ? 1 : 0;
          compareB = b.conduitCommonsVersion.usingLatest ? 1 : 0;
          break;
        default:
          compareA = a.workflowChecks[column] ? 1 : 0;
          compareB = b.workflowChecks[column] ? 1 : 0;
          break;
      }

      if (compareA < compareB) return direction === 'asc' ? -1 : 1;
      if (compareA > compareB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setRepositories(sortedData);
  };

  if (loading) {
    return <p>Loading repositories...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const renderBooleanCell = (value: boolean) => (
    <td style={{ backgroundColor: value ? '#28a745' : '#dc3545', color: 'white', padding: '0.5rem', textAlign: 'center' }}>
      {value.toString()}
    </td>
  );

  const renderVersionCell = (version: Version, latestKey: string) => (
    <>
      <td>{version.currentVersion}</td>
      {renderBooleanCell(version.usingLatest)}
    </>
  );

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2rem' }}>
      <thead>
        <tr>
          <th onClick={() => handleSort('nameWithOwner')} style={{ cursor: 'pointer' }}>Repository</th>
          <th onClick={() => handleSort('toolsGoIsCorrect')} style={{ cursor: 'pointer' }}>Tools Go Is Correct</th>
          <th onClick={() => handleSort('makefileIsCorrect')} style={{ cursor: 'pointer' }}>Makefile Is Correct</th>
          <th onClick={() => handleSort('goVersion')} style={{ cursor: 'pointer' }}>Go Version</th>
          <th onClick={() => handleSort('goVersionLatest')} style={{ cursor: 'pointer' }}>Go Version Latest</th>
          <th onClick={() => handleSort('connectorSDKVersion')} style={{ cursor: 'pointer' }}>Connector SDK Version</th>
          <th onClick={() => handleSort('connectorSDKVersionLatest')} style={{ cursor: 'pointer' }}>SDK Version Latest</th>
          <th onClick={() => handleSort('conduitCommonsVersion')} style={{ cursor: 'pointer' }}>Conduit Commons Version</th>
          <th onClick={() => handleSort('conduitCommonsVersionLatest')} style={{ cursor: 'pointer' }}>Commons Version Latest</th>
          <th onClick={() => handleSort('hasScarfPixel')} style={{ cursor: 'pointer' }}>Has Scarf Pixel</th>
          <th onClick={() => handleSort('dependabot-auto-merge-go.yml')} style={{ cursor: 'pointer' }}>Dependabot Auto-Merge</th>
          <th onClick={() => handleSort('lint.yml')} style={{ cursor: 'pointer' }}>Lint</th>
          <th onClick={() => handleSort('project-automation.yml')} style={{ cursor: 'pointer' }}>Project Automation</th>
          <th onClick={() => handleSort('release.yml')} style={{ cursor: 'pointer' }}>Release</th>
          <th onClick={() => handleSort('test.yml')} style={{ cursor: 'pointer' }}>Test</th>
          <th onClick={() => handleSort('validate-generated-files.yml')} style={{ cursor: 'pointer' }}>Validate Generated Files</th>
        </tr>
      </thead>
      <tbody>
        {repositories.map(repo => (
          <tr key={repo.nameWithOwner}>
            <td>
              <a href={repo.url} target="_blank" rel="noopener noreferrer">
                {repo.nameWithOwner}
              </a>
            </td>
            {renderBooleanCell(repo.toolsGoIsCorrect)}
            {renderBooleanCell(repo.makefileIsCorrect)}
            {renderVersionCell(repo.goVersion, 'goVersionLatest')}
            {renderVersionCell(repo.connectorSDKVersion, 'connectorSDKVersionLatest')}
            {renderVersionCell(repo.conduitCommonsVersion, 'conduitCommonsVersionLatest')}
            {renderBooleanCell(repo.hasScarfPixel)}
            {renderBooleanCell(repo.workflowChecks['dependabot-auto-merge-go.yml'])}
            {renderBooleanCell(repo.workflowChecks['lint.yml'])}
            {renderBooleanCell(repo.workflowChecks['project-automation.yml'])}
            {renderBooleanCell(repo.workflowChecks['release.yml'])}
            {renderBooleanCell(repo.workflowChecks['test.yml'])}
            {renderBooleanCell(repo.workflowChecks['validate-generated-files.yml'])}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ConnectorTable;
