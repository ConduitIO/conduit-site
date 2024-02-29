import React from 'react';
import { styled } from '@mui/material/styles';

import ReactDiffViewer from 'react-diff-viewer';
import MuiAccordion, {AccordionProps} from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Chip from '@mui/material/Chip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from "@mui/material/IconButton";
import Stack from '@mui/material/Stack';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Markdown from "react-markdown";
import Box from "@mui/system/Box";

export class Example {
  description: string;
  config: any;
  have: any;
  want: any;
}

export interface IAccordionProps extends AccordionProps {
  example: Example;
}

const ExampleAccordion = styled((props: IAccordionProps) => (
  <MuiAccordion disableGutters {...props}>
    <MuiAccordionSummary>
      {props.example.description}
    </MuiAccordionSummary>
    <MuiAccordionDetails>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant='body1'>
          Configuration
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              {Object.keys(props.example.config).map(name => (
                <TableRow key={name}>
                  <TableCell component="th" scope="row">
                    <code>{name}</code>
                  </TableCell>
                  <TableCell>
                    <Markdown className='parameter-value'>{"```\n" + props.example.config[name] + "\n```"}</Markdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant='body1'>
          Record diff
        </Typography>
        <Box className='diff-viewer' sx={{ width: '100%', overflow: 'hidden' }}>
          <ReactDiffViewer
            styles={{
              diffContainer: {
                overflowX: 'auto',
                overflowY: 'hidden',
              },
            }}
            leftTitle={'Record before'}
            rightTitle={'Record after'}
            oldValue={JSON.stringify(props.example.have, null, 2)}
            newValue={JSON.stringify(props.example.want, null, 2)}
            hideLineNumbers={false}
            showDiffOnly={false}
            splitView={true}
          />
        </Box>
      </Box>
    </MuiAccordionDetails>
  </MuiAccordion>
))(({ theme }) => ({
  '& .parameter-value>*': {
    margin: 0,
  },
  // -- Diff Viewer --
  '& .diff-viewer td': {
    padding: '1px',
  },
  '& .diff-viewer td span': {
    whiteSpace: 'preserve nowrap',
  },
  '& .diff-viewer pre': {
    lineHeight: 'inherit',
    padding: '1px 10px',
    backgroundColor: 'transparent',
    whiteSpace: 'preserve nowrap',
    fontSize: '0.8em',
  },
  '& .diff-viewer table td': {
    border: 0,
  },
  '& .diff-viewer table tr': {
    border: 0,
    backgroundColor: 'inherit',
  },
}));

function stopPropagation(e) {
  e.stopPropagation();
}

export default ExampleAccordion;