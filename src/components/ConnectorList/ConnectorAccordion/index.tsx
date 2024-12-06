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
import Tooltip from '@mui/material/Tooltip';
import ReleaseAccordion, {Release} from "@site/src/components/ConnectorList/ReleaseAccordion";
import Link from '@mui/material/Link';

export class Connector {
  nameWithOwner: string;
  description: string;
  url: string;
  conduitIODocsPage: string;
  created_at: string;
  stargazerCount: number;
  forkCount: number;
  releases: Release[];
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
          ? props.connector.releases.map((release: Release, index: number) => (
            <ReleaseAccordion key={release.tag_name} release={release} defaultExpanded={index==0}  children=''/>
          ))
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
    expandIcon={<ArrowForwardIosSharpIcon />}
    {...props}
  >
    <Stack className='width-100pct' direction='row' spacing={2} >
      <Stack className='width-100pct' >
        <Typography variant='body1'>{props.connector.nameWithOwner}</Typography>
        <Typography variant='body2' className='color-6b7280' >{props.connector.description}</Typography>
      </Stack>
      <Stack className='align-items-center' direction='row' justifyContent='flex-end' spacing={2} >
        {
          (props.connector.conduitIODocsPage && props.connector.conduitIODocsPage.trim() !== "")
            ? <Link href={props.connector.conduitIODocsPage}>View docs</Link>
            : null
        }
        {
          props.connector.nameWithOwner.toLowerCase().startsWith('conduitio/') || props.connector.nameWithOwner.toLowerCase().startsWith('conduitio-labs/')
            ? <Tooltip title="Created by the Conduit team"><img src='/img/conduit/conduit-ring.png' width='18'/></Tooltip>
            : null
        }
        <IconButton size='small' href={props.connector.url} target='_blank' onClick={stopPropagation}>
          <GitHubIcon fontSize='inherit' />
        </IconButton>
        <Chip icon={<StarIcon />} label={props.connector.stargazerCount} size='small' />
      </Stack>
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

function stopPropagation(e) {
  e.stopPropagation();
}

export default ConnectorAccordion;