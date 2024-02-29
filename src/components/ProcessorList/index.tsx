import ProcessorAccordion, {Processor} from '@site/src/components/ProcessorList/ProcessorAccordion';
import React from "react";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Markdown from 'react-markdown';

class Filter {
  nameQuery: string;

  constructor(nameQuery: string='') {
    this.nameQuery = nameQuery;
  }

  matches(processor: Processor): boolean {
    return !(this.nameQuery &&
      !processor.specification.name.toLowerCase().includes(this.nameQuery));
  }
}

class ProcessorListState {
  allProcessors: Processor[];
  filter: Filter;
}

class ProcessorList extends React.Component<{processors: Processor[]}, ProcessorListState> {
  constructor(props: {processors: Processor[]}) {
    super(props);
    this.state = {
      allProcessors: props.processors,
      filter: new Filter(),
    }
  }

  onQueryChange(query: string) {
    this.setState((state) => {
      state.filter.nameQuery = query.toLowerCase();
      return {filter: state.filter};
    });
  };
  filterProcessors(filter: Filter, processors: Processor[]): Processor[] {
    const filtered: Processor[] = [];
    processors.forEach((item) => {
      if (filter.matches(item)) {
        filtered.push(item);
      }
    });
    return filtered;
  };

  render() {
    const processors = this.filterProcessors(this.state.filter, this.state.allProcessors);
    return (
      <>
        <TextField
          fullWidth
          margin='normal'
          placeholder='Search processor by name ...'
          onChange={(e) => { this.onQueryChange(e.target.value) }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {processors.map(proc => (
          <ProcessorAccordion key={proc.specification.name} processor={proc} />
        ))}
      </>
    );
  }
}

export default ProcessorList;