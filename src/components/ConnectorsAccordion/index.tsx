import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionDetails, { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import StarIcon from '@mui/icons-material/Star';
import GitHubIcon from '@mui/icons-material/GitHub';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from "@mui/material/Box";

export interface IAccordionSummaryProps extends AccordionSummaryProps {
  name: string;
  description: string;
  stargazerCount: number;
  url: string;
}

export const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0}  {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

export const AccordionSummary = styled((props: IAccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  >
    <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Stack>
          <Typography variant='body1' sx={{ textDecoration: 'underline' }}>{props.name}</Typography>
          <Typography variant='body2' sx={{ color:'#6B7280' }}>{props.description}</Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size='small' href={props.url} target='_blank'>
          <GitHubIcon fontSize='small' />
        </IconButton>
        <Chip icon={<StarIcon />} label={props.stargazerCount} size='small' />
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

export const AccordionDetails = styled((props: AccordionDetailsProps) => (
  <MuiAccordionDetails {...props}>
    {props.children}
  </MuiAccordionDetails>
))(({ theme }) => ({
}));

export interface ReleaseAccordionProps extends AccordionProps {}

export const ReleaseAccordion = styled((props: ReleaseAccordionProps) => (
  <MuiAccordion disableGutters {...props}>
    {props.children}
  </MuiAccordion>
))(({ theme }) => ({
}));

export interface ReleaseAccordionSummaryProps extends AccordionSummaryProps {
  tag: string;
}

export const ReleaseAccordionSummary = styled((props: ReleaseAccordionSummaryProps) => (
  <MuiAccordionSummary {...props}>
    <Typography>{props.tag}</Typography>
  </MuiAccordionSummary>
))(({ theme }) => ({
}));

export interface ReleaseAccordionDetailsProps extends AccordionDetailsProps {}

export const ReleaseAccordionDetails = styled((props: ReleaseAccordionDetailsProps) => (
  <MuiAccordionDetails {...props}>
    {props.children}
  </MuiAccordionDetails>
))(({ theme }) => ({
}));
