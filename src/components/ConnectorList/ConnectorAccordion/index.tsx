import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import StarIcon from '@mui/icons-material/Star';
import GitHubIcon from '@mui/icons-material/GitHub';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ReleaseAccordion, { Release } from '@site/src/components/ConnectorList/ReleaseAccordion';
import { Paper } from '@mui/material';

export class Connector {
  name_with_owner: string;
  description: string;
  conduitIODocsPage: string;
  url: string;
  created_at: string;
  stargazer_count: number;
  fork_count: number;
  releases: Release[];
}

export interface ConnectorAccordionProps extends AccordionProps {
  connector: Connector;
}

export const ConnectorAccordion = styled((props: ConnectorAccordionProps) => (
    <MuiAccordion disableGutters elevation={0} {...props}>
        <ConnectorAccordionSummary connector={props.connector} />
        <MuiAccordionDetails>
            {props.connector.releases.length > 0 ? (
                props.connector.releases
                    .filter((release) => release.is_latest === true)
                    .map((release: Release, index: number) => (
                        <ReleaseAccordion
                            key={release.tag_name}
                            release={release}
                            defaultExpanded={true}
                            children=""
                        />
                    ))
            ) : (
                <Typography>No releases.</Typography>
            )}
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

export const NonExpandableAccordion = styled((props: ConnectorAccordionProps) => {
  const handleClick = () => {
    window.location.href = props.connector.conduitIODocsPage;
  };

  return (
    <Paper elevation={0} onClick={handleClick} {...props}>
      <Stack className='width-100pct' direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack flexGrow={1}>
          <Typography variant="body1">{props.connector.name_with_owner}</Typography>
          <Typography variant="body2" className="color-6b7280">
            {props.connector.description}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {props.connector.name_with_owner.toLowerCase().startsWith('conduitio/') ||
          props.connector.name_with_owner.toLowerCase().startsWith('conduitio-labs/') ? (
            <Tooltip title="Created by the Conduit team">
              <img src="/img/conduit/conduit-ring.png" width="18" alt="Conduit team logo" />
            </Tooltip>
          ) : null}
          <IconButton size="small" href={props.connector.url} target="_blank" onClick={stopPropagation}>
            <GitHubIcon fontSize="inherit" />
          </IconButton>
          <Chip icon={<StarIcon />} label={props.connector.stargazer_count} size="small" />
        </Stack>
      </Stack>
    </Paper>
  );
})(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
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

export const ConnectorAccordionSummary = styled((props: ConnectorAccordionSummaryProps) => {
  const content = (
    <Stack className='width-100pct' direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Stack flexGrow={1}>
        <Typography variant="body1">{props.connector.name_with_owner}</Typography>
        <Typography variant="body2" className="color-6b7280">
          {props.connector.description}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {props.connector.name_with_owner.toLowerCase().startsWith('conduitio/') ||
        props.connector.name_with_owner.toLowerCase().startsWith('conduitio-labs/') ? (
          <Tooltip title="Created by the Conduit team">
            <img src="/img/conduit/conduit-ring.png" width="18" alt="Conduit team logo" />
          </Tooltip>
        ) : null}
        <IconButton size="small" href={props.connector.url} target="_blank" onClick={stopPropagation}>
          <GitHubIcon fontSize="inherit" />
        </IconButton>
        <Chip icon={<StarIcon />} label={props.connector.stargazer_count} size="small" />
      </Stack>
    </Stack>
  );

  return (
    <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon />} {...props}>
      {content}
    </MuiAccordionSummary>
  );
})(({ theme }) => ({
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
    color: '#6B7280',
  },
}));

function stopPropagation(e) {
  e.stopPropagation();
}
