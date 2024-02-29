import * as React from 'react';
import { styled } from '@mui/material/styles';

import ExampleAccordion, {Example} from "@site/src/components/ProcessorList/ExampleAccordion";

import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';

import Table from '@mui/material/Table';
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
        <ExampleAccordion example={example} />
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


