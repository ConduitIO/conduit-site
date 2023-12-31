import * as React from 'react';
import { styled } from '@mui/material/styles';
import Accordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
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

export interface IAccordionProps extends AccordionProps {
  connector: Connector;
}

const ConnectorAccordion = styled((props: IAccordionProps) => (
  <Accordion disableGutters elevation={0}  {...props}>
    <AccordionSummary {...props.connector} />
    <AccordionDetails>
      {
        props.connector.releases.length > 0
          ? props.connector.releases.map(release => ( <ReleaseAccordion release={release} /> ))
          : <Typography>No releases.</Typography>
      }
    </AccordionDetails>
  </Accordion>
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((connector: Connector) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
  >
    <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Stack>
          <Typography variant='body1'>{connector.nameWithOwner}</Typography>
          <Typography variant='body2' sx={{ color:'#6B7280' }}>{connector.description}</Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size='small' href={connector.url} target='_blank' onClick={stopPropagation}>
          <GitHubIcon fontSize='inherit' />
        </IconButton>
        <Chip icon={<StarIcon />} label={connector.stargazerCount} size='small' />
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