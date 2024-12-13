import React, { useEffect, useState } from 'react';
import styles from './doctor.module.css'; // Import the CSS module

interface Version {
  currentVersion: string;
  usingLatest: boolean;
}

interface WorkflowChecks {
  [key: string]: boolean;
}

interface LatestRelease {
  tag_name: string;
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
  latestRelease?: LatestRelease;
}

const ConnectorTable: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [toolsGoFilter, setToolsGoFilter] = useState<string>('all');
  const [makefileFilter, setMakefileFilter] = useState<string>('all');
  const [latestGoVersionFilter, setLatestGoVersionFilter] = useState<string>('all');
  const [latestSDKVersionFilter, setLatestSDKVersionFilter] = useState<string>('all');
  const [latestCommonsVersionFilter, setLatestCommonsVersionFilter] = useState<string>('all');
  const [releasedFilter, setReleasedFilter] = useState<string>('all');
  const [hasScarfPixelFilter, setHasScarfPixelFilter] = useState<string>('all');
  const [dependabotAutoMergeFilter, setDependabotAutoMergeFilter] = useState<string>('all');
  const [lintFilter, setLintFilter] = useState<string>('all');
  const [projectAutomationFilter, setProjectAutomationFilter] = useState<string>('all');
  const [releaseFilter, setReleaseFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');
  const [validateGeneratedFilesFilter, setValidateGeneratedFilesFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/connectors.json')
      .then(response => response.json())
      .then(data => {
        setRepositories(data);
        setFilteredRepositories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = repositories;

    if (ownerFilter !== 'all') {
      filtered = filtered.filter(repo => {
        const isConduit = repo.nameWithOwner.toLowerCase().includes('conduitio');
        return ownerFilter === 'conduit' ? isConduit : !isConduit;
      });
    }

    if (toolsGoFilter !== 'all') {
      const isCorrect = toolsGoFilter === 'true';
      filtered = filtered.filter(repo => repo.toolsGoIsCorrect === isCorrect);
    }

    if (makefileFilter !== 'all') {
      const isCorrect = makefileFilter === 'true';
      filtered = filtered.filter(repo => repo.makefileIsCorrect === isCorrect);
    }

    if (latestGoVersionFilter !== 'all') {
      const isUsingLatest = latestGoVersionFilter === 'true';
      filtered = filtered.filter(repo => repo.goVersion.usingLatest === isUsingLatest);
    }

    if (latestSDKVersionFilter !== 'all') {
      const isUsingLatest = latestSDKVersionFilter === 'true';
      filtered = filtered.filter(repo => repo.connectorSDKVersion.usingLatest === isUsingLatest);
    }

    if (latestCommonsVersionFilter !== 'all') {
      const isUsingLatest = latestCommonsVersionFilter === 'true';
      filtered = filtered.filter(repo => repo.conduitCommonsVersion.usingLatest === isUsingLatest);
    }

    if (releasedFilter !== 'all') {
      const isReleased = releasedFilter === 'true';
      filtered = filtered.filter(repo => (!!repo.latestRelease) === isReleased);
    }

    if (hasScarfPixelFilter !== 'all') {
      const hasPixel = hasScarfPixelFilter === 'true';
      filtered = filtered.filter(repo => repo.hasScarfPixel === hasPixel);
    }

    if (dependabotAutoMergeFilter !== 'all') {
      const isEnabled = dependabotAutoMergeFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['dependabot-auto-merge-go.yml'] === isEnabled);
    }

    if (lintFilter !== 'all') {
      const isEnabled = lintFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['lint.yml'] === isEnabled);
    }

    if (projectAutomationFilter !== 'all') {
      const isEnabled = projectAutomationFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['project-automation.yml'] === isEnabled);
    }

    if (releaseFilter !== 'all') {
      const isEnabled = releaseFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['release.yml'] === isEnabled);
    }

    if (testFilter !== 'all') {
      const isEnabled = testFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['test.yml'] === isEnabled);
    }

    if (validateGeneratedFilesFilter !== 'all') {
      const isEnabled = validateGeneratedFilesFilter === 'true';
      filtered = filtered.filter(repo => repo.workflowChecks['validate-generated-files.yml'] === isEnabled);
    }

    setFilteredRepositories(filtered);
  }, [
    ownerFilter,
    toolsGoFilter,
    makefileFilter,
    latestGoVersionFilter,
    latestSDKVersionFilter,
    latestCommonsVersionFilter,
    releasedFilter,
    hasScarfPixelFilter,
    dependabotAutoMergeFilter,
    lintFilter,
    projectAutomationFilter,
    releaseFilter,
    testFilter,
    validateGeneratedFilesFilter,
    repositories,
  ]);

  const handleSort = (column: string) => {
    const direction = sortedColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortedColumn(column);
    setSortDirection(direction);

    const sortedData = [...filteredRepositories].sort((a, b) => {
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
        case 'latestReleaseVersion':
          compareA = a.latestRelease?.tag_name || '';
          compareB = b.latestRelease?.tag_name || '';
          break;
        case 'released':
          compareA = a.latestRelease ? 1 : 0;
          compareB = b.latestRelease ? 1 : 0;
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

    setFilteredRepositories(sortedData);
  };

  if (loading) {
    return <p>Loading repositories...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const renderBooleanCell = (value: boolean) => (
    <td className={value ? styles.booleanTrue : styles.booleanFalse}>
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
    <div>
      <div className={styles.filterContainer}>
        <label>
          Owner:
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="conduit">Conduit</option>
            <option value="community">Community Connectors</option>
          </select>
        </label>
        <label>
          Tools Go:
          <select value={toolsGoFilter} onChange={e => setToolsGoFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Makefile:
          <select value={makefileFilter} onChange={e => setMakefileFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Using latest Go version:
          <select value={latestGoVersionFilter} onChange={e => setLatestGoVersionFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Using latest SDK version:
          <select value={latestSDKVersionFilter} onChange={e => setLatestSDKVersionFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Using latest Commons:
          <select value={latestCommonsVersionFilter} onChange={e => setLatestCommonsVersionFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Released:
          <select value={releasedFilter} onChange={e => setReleasedFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Has Scarf Pixel:
          <select value={hasScarfPixelFilter} onChange={e => setHasScarfPixelFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Dependabot Auto-Merge:
          <select value={dependabotAutoMergeFilter} onChange={e => setDependabotAutoMergeFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Lint:
          <select value={lintFilter} onChange={e => setLintFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Project Automation:
          <select value={projectAutomationFilter} onChange={e => setProjectAutomationFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Release:
          <select value={releaseFilter} onChange={e => setReleaseFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Test:
          <select value={testFilter} onChange={e => setTestFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Workflow: Validate Generated Files:
          <select value={validateGeneratedFilesFilter} onChange={e => setValidateGeneratedFilesFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('nameWithOwner')}>Repository</th>
            <th onClick={() => handleSort('toolsGoIsCorrect')}>Tools Go</th>
            <th onClick={() => handleSort('makefileIsCorrect')}>Makefile</th>
            <th onClick={() => handleSort('goVersion')}>Go Version</th>
            <th onClick={() => handleSort('goVersionLatest')}>Using latest Go version</th>
            <th onClick={() => handleSort('connectorSDKVersion')}>Connector SDK Version</th>
            <th onClick={() => handleSort('connectorSDKVersionLatest')}>Using latest SDK Version</th>
            <th onClick={() => handleSort('conduitCommonsVersion')}>Conduit Commons Version</th>
            <th onClick={() => handleSort('conduitCommonsVersionLatest')}>Using latest Commons</th>
            <th onClick={() => handleSort('latestReleaseVersion')}>Latest Released Version</th>
            <th onClick={() => handleSort('released')}>Released</th>
            <th onClick={() => handleSort('hasScarfPixel')}>Has Scarf Pixel</th>
            <th onClick={() => handleSort('dependabot-auto-merge-go.yml')}>Workflow: Dependabot Auto-Merge</th>
            <th onClick={() => handleSort('lint.yml')}>Lint</th>
            <th onClick={() => handleSort('project-automation.yml')}>Workflow: Project Automation</th>
            <th onClick={() => handleSort('release.yml')}>Workflow: Release</th>
            <th onClick={() => handleSort('test.yml')}>Workflow: Test</th>
            <th onClick={() => handleSort('validate-generated-files.yml')}>Workflow: Validate Generated Files</th>
          </tr>
        </thead>
        <tbody>
          {filteredRepositories.map(repo => (
            <tr key={repo.nameWithOwner}>
              <td className={styles.repository}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  <img src="img/github.svg" alt="GitHub" className={styles.githubLogo} />
                  {repo.nameWithOwner}
                </a>
              </td>
              {renderBooleanCell(repo.toolsGoIsCorrect)}
              {renderBooleanCell(repo.makefileIsCorrect)}
              {renderVersionCell(repo.goVersion, 'goVersionLatest')}
              {renderVersionCell(repo.connectorSDKVersion, 'connectorSDKVersionLatest')}
              {renderVersionCell(repo.conduitCommonsVersion, 'conduitCommonsVersionLatest')}
              <td>{repo.latestRelease?.tag_name || ''}</td>
              {renderBooleanCell(!!repo.latestRelease)}
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
    </div>
  );
};

export default ConnectorTable;
