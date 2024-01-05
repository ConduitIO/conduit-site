import React from "react";
import MuiAccordion, {AccordionProps} from "@mui/material/Accordion";
import {styled} from "@mui/material/styles";
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

import Markdown from 'react-markdown';

export class Release {
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  html_url: string;
  assets: Asset[];
}

export class Asset {
  name: string;
  os: string;
  arch: string;
  content_type: string;
  browser_download_url: string;
  created_at: string;
  updated_at: string;
  download_count: number;
  size: number;
}

export interface IAccordionProps extends AccordionProps {
  release: Release;
}

function humanFileSize(size) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

const ReleaseAccordion = styled((props: IAccordionProps) => (
  <MuiAccordion disableGutters {...props}>
    <MuiAccordionSummary>
      <Stack direction='row' spacing={1}>
        <Chip label={props.release.tag_name} size='small' sx={{ display: 'flex', alignItems: 'center', height:'100%'}} />
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center'}}>{Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format(new Date(props.release.published_at))}</Typography>
        <IconButton size='small' href={props.release.html_url} target='_blank' onClick={stopPropagation}>
          <OpenInNewIcon fontSize='inherit' />
        </IconButton>
      </Stack>
    </MuiAccordionSummary>
    <MuiAccordionDetails>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{ '& td, & th': {border: 0} }}
            >
              <TableCell>File</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Arch</TableCell>
              <TableCell>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.release.assets.map(asset => (
              <TableRow
                key={asset.name}
                sx={{ '& td, & th': {border: 0} }}
              >
                <TableCell component="th" scope="row">
                  <a href={asset.browser_download_url}>{asset.name}</a>
                </TableCell>
                <TableCell>{asset.os}</TableCell>
                <TableCell>{asset.arch}</TableCell>
                <TableCell>{humanFileSize(asset.size)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant='body2'>
        <Markdown>{props.release.body}</Markdown>
      </Typography>
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

function stopPropagation(e) {
  e.stopPropagation();
}

export default ReleaseAccordion;