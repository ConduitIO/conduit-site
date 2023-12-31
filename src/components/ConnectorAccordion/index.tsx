import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import StarIcon from '@mui/icons-material/Star';
import GitHubIcon from '@mui/icons-material/GitHub';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import ReleaseAccordion, {Release} from "@site/src/components/ConnectorAccordion/ReleaseAccordion";

export class Connector {
  nameWithOwner: string;
  description: string;
  url: string;
  created_at: string;
  stargazerCount: number;
  forkCount: number;
  releases: [Release];
}

export interface ConnectorAccordionProps extends AccordionProps {
  connector: Connector;
}

const ConnectorAccordion = styled((props: ConnectorAccordionProps) => (
  <MuiAccordion disableGutters elevation={0}  {...props}>
    <ConnectorAccordionSummary connector={props.connector} />
    <MuiAccordionDetails>
      {
        props.connector.releases.length > 0
          ? props.connector.releases.map((release: Release, index: number) => ( <ReleaseAccordion release={release} defaultExpanded={index==0}  children=''/> ))
          : <Typography>No releases.</Typography>
      }
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
}));

export interface ConnectorAccordionSummaryProps extends AccordionSummaryProps {
  connector: Connector;
}

export const ConnectorAccordionSummary = styled((props: ConnectorAccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  >
    <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Stack>
          <Typography variant='body1'>{props.connector.nameWithOwner}</Typography>
          <Typography variant='body2' sx={{ color:'#6B7280' }}>{props.connector.description}</Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size='small' href={props.connector.url} target='_blank' onClick={stopPropagation}>
          <GitHubIcon fontSize='inherit' />
        </IconButton>
        <Chip icon={<StarIcon />} label={props.connector.stargazerCount} size='small' />
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
}));

function stopPropagation(e) {
  e.stopPropagation();
}

export default ConnectorAccordion;