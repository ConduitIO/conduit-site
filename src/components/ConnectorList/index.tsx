import ConnectorAccordion, {Connector} from '@site/src/components/ConnectorList/ConnectorAccordion';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import React from "react";
import Typography from "@mui/material/Typography";
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BorderedSection from "@site/src/components/BorderedSection";

class Filter {
  nameWithOwnerQuery: string;
  showWithoutRelease: boolean;
  showCommunity: boolean;

  constructor(nameWithOwnerQuery: string='', showWithoutRelease: boolean=false, showCommunity: boolean=false) {
    this.nameWithOwnerQuery = nameWithOwnerQuery;
    this.showWithoutRelease = showWithoutRelease;
    this.showCommunity = showCommunity;
  }

  matches(connector: Connector): boolean {
    if (!this.showWithoutRelease &&
      !connector.latestRelease) {
      return false;
    }
    if (!this.showCommunity &&
      !connector.nameWithOwner.toLowerCase().startsWith('conduitio/') &&
      !connector.nameWithOwner.toLowerCase().startsWith('conduitio-labs/')) {
      return false;
    }
    if (this.nameWithOwnerQuery &&
      !connector.nameWithOwner.toLowerCase().includes(this.nameWithOwnerQuery)) {
      return false;
    }
    return true;
  }

  showAll(): boolean {
    return !this.nameWithOwnerQuery && this.showWithoutRelease && this.showCommunity;
  }
}

class ConnectorListState {
  allConnectors: Connector[];
  filter: Filter;
}

class ConnectorList extends React.Component<{connectors: Connector[]}, ConnectorListState> {
  constructor(props: {connectors: Connector[]}) {
    super(props);
    this.state = {
      allConnectors: this.sortConnectors(props.connectors),
      filter: new Filter(),
    }
  }

  sortConnectors(connectors: Connector[]): Connector[] {
    return connectors.sort((a: Connector, b: Connector): number => {
      const hasOwner = (c: Connector, owner: string) => {
        return c.nameWithOwner.toLowerCase().startsWith(owner + '/');
      }

      // ConduitIO repos first
      const aOwnerIsConduitio = hasOwner(a, 'conduitio')
      const bOwnerIsConduitio = hasOwner(b, 'conduitio')
      if (aOwnerIsConduitio && !bOwnerIsConduitio) { return -1; }
      if (!aOwnerIsConduitio && bOwnerIsConduitio) { return 1; }

      // ConduitIO-labs repos next
      const aOwnerIsConduitioLabs = hasOwner(a, 'conduitio-labs')
      const bOwnerIsConduitioLabs = hasOwner(b, 'conduitio-labs')
      if (aOwnerIsConduitioLabs && !bOwnerIsConduitioLabs) { return -1; }
      if (!aOwnerIsConduitioLabs && bOwnerIsConduitioLabs) { return 1; }

      // Sort by name everywhere else
      if (a.nameWithOwner.toLowerCase() < b.nameWithOwner.toLowerCase()) {
        return -1;
      }
      return 1;
    });
  }
  onQueryChange(query: string) {
    this.setState((state) => {
      state.filter.nameWithOwnerQuery = query.toLowerCase();
      return {filter: state.filter};
    });
  };
  onHideWithoutRelease(show: boolean) {
    this.setState((state) => {
      state.filter.showWithoutRelease = show;
      return {filter: state.filter};
    });
  };
  onHideCommunity(show: boolean) {
    this.setState((state) => {
      state.filter.showCommunity = show;
      return {filter: state.filter};
    });
  };
  filterConnectors(filter: Filter, connectors: Connector[]): Connector[] {
    if (filter.showAll()) {
      return connectors;
    }

    const filtered: Connector[] = [];
    connectors.forEach((item) => {
      if (filter.matches(item)) {
        filtered.push(item);
      }
    });
    return filtered;
  };

  render() {
    const connectors = this.filterConnectors(this.state.filter, this.state.allConnectors);
    return (
      <>
        <BorderedSection title="Filters">
          <Stack>
            <Stack direction='row'>
              <Switch onChange={(e) => { this.onHideWithoutRelease(e.target.checked) }} />
              <Box display="flex" alignItems="center">
                <Typography>Show unreleased connectors</Typography>
                <Tooltip sx={{ ml: 1 }} placement="right" title="Some connectors are still being implemented and are not released yet. You can however try to build them yourself.">
                  <IconButton size='small'>
                    <InfoIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
            <Stack direction='row'>
              <Switch onChange={(e) => { this.onHideCommunity(e.target.checked) }} />
              <Box display="flex" alignItems="center">
                <Typography>Show community connectors</Typography>
                <Tooltip sx={{ ml: 1 }} placement="right" title="This will show connectors created by anyone, not only the Conduit team. We do not test or review those connectors and can not vouch for their quality.">
                  <IconButton size='small'>
                    <InfoIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </BorderedSection>
        <TextField
          fullWidth
          margin='normal'
          placeholder='Search connector by name ...'
          onChange={(e) => { this.onQueryChange(e.target.value) }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {connectors.map(conn => (
          <ConnectorAccordion key={conn.url} connector={conn} />
        ))}
      </>
    );
  }
}

export default ConnectorList;