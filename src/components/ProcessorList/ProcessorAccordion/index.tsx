import * as React from 'react';
import { styled } from '@mui/material/styles';

import ReactDiffViewer from 'react-diff-viewer';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';

import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import Markdown from "react-markdown";

export class Processor {
  specification: Specification;
  examples: Example[];
}

export class Specification {
  name: string;
  summary: string;
  description: string;
  version: string;
  author: string;
  parameters: any;
}

export class Parameter {
  default: string;
  description: string;
  type: string;
  validations: Validation[];
}

export class Example {
  description: string;
  config: any;
  have: any;
  want: any;
}

export class Validation {
  type: string;
  value: string;
}

export interface ProcessorAccordionProps extends AccordionProps {
  processor: Processor;
}

const ProcessorAccordion = styled((props: ProcessorAccordionProps) => (
  <MuiAccordion disableGutters defaultExpanded elevation={0}  {...props}>
    <ProcessorAccordionSummary processor={props.processor} />
    <MuiAccordionDetails>
      <Typography variant='h5' component='span'>
        Description
      </Typography>
      <Typography variant='body2' component='span'>
        <Markdown>{props.processor.specification.description}</Markdown>
      </Typography>
      <Typography variant='h5' component='span'>
        Parameters
      </Typography>
      <Table>
        <TableBody>
          {Object.keys(props.processor.specification.parameters).map(name => (
            <TableRow key={name}>
              <TableCell component="th" scope="row">
                <code>{name}</code>
              </TableCell>
              <TableCell>
                <Markdown className='parameter-value'>{props.processor.specification.parameters[name].description}</Markdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant='h5' component='span'>
        Examples
      </Typography>
      {props.processor.examples.map((example, index) => (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableBody>
                {Object.keys(example.config).map(name => (
                  <TableRow key={name}>
                    <TableCell component="th" scope="row">
                      <code>{name}</code>
                    </TableCell>
                    <TableCell>
                      <Markdown className='parameter-value'>{"```\n" + example.config[name] + "\n```"}</Markdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant='h6' component='span'>
            {example.description}
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
              oldValue={JSON.stringify(example.have, null, 2)}
              newValue={JSON.stringify(example.want, null, 2)}
              hideLineNumbers={false}
              showDiffOnly={false}
              splitView={true}
            />
          </Box>
        </Box>
      ))}
    </MuiAccordionDetails>
  </MuiAccordion>
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
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

export interface ProcessorAccordionSummaryProps extends AccordionSummaryProps {
  processor: Processor;
}

export const ProcessorAccordionSummary = styled((props: ProcessorAccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon />}
    {...props}
  >
    <Stack className='width-100pct' direction='row' spacing={2} >
      <Typography variant='h6'><code>{props.processor.specification.name}</code></Typography>
      <Box display="flex" alignItems="center">
        <Typography variant='body2' className='color-6b7280' >{props.processor.specification.summary}</Typography>
      </Box>
    </Stack>
  </MuiAccordionSummary>
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
  '& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
    fontSize: '0.9rem',
  },
  '& .width-100pct': {
    width: '100%',
  },
  '& .align-items-center': {
    alignItems: 'center',
  },
  '& .color-6b7280': {
    color:'#6B7280',
  }
}));

export default ProcessorAccordion;


