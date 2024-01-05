import ConnectorAccordion, {Connector} from '@site/src/components/ConnectorList/ConnectorAccordion';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import React from "react";
import Typography from "@mui/material/Typography";

class Filter {
  nameWithOwnerQuery: string;
  hideWithoutRelease: boolean;
  hideCommunity: boolean;

  constructor(nameWithOwnerQuery: string='', hideWithoutRelease: boolean=true, hideCommunity: boolean=true) {
    this.nameWithOwnerQuery = nameWithOwnerQuery;
    this.hideWithoutRelease = hideWithoutRelease;
    this.hideCommunity = hideCommunity;
  }

  matches(connector: Connector): boolean {
    if (this.hideWithoutRelease &&
      (!connector.releases || connector.releases.length == 0)) {
      return false;
    }
    if (this.hideCommunity &&
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

  isEmpty(): boolean {
    return !this.nameWithOwnerQuery && !this.hideWithoutRelease && !this.hideCommunity;
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
  onHideWithoutRelease(hide: boolean) {
    this.setState((state) => {
      state.filter.hideWithoutRelease = hide;
      return {filter: state.filter};
    });
  };
  onHideCommunity(hide: boolean) {
    this.setState((state) => {
      state.filter.hideCommunity = hide;
      return {filter: state.filter};
    });
  };
  filterConnectors(filter: Filter, connectors: Connector[]): Connector[] {
    if (filter.isEmpty()) {
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
        <Stack sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: '4px', p: 1 }}>
          <Stack direction='row'>
            <Switch defaultChecked onChange={(e) => { this.onHideWithoutRelease(e.target.checked) }} />
            <Box display="flex" alignItems="center">
              Hide connectors without a release
            </Box>
          </Stack>
          <Stack direction='row'>
            <Switch defaultChecked onChange={(e) => { this.onHideCommunity(e.target.checked) }} />
            <Box display="flex" alignItems="center">
              Only show connectors from the Conduit team
            </Box>
          </Stack>
        </Stack>
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
          <ConnectorAccordion key={conn.url} connector={conn} children={''} />
        ))}
      </>
    );
  }
}

export default ConnectorList;