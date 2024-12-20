import { styled } from '@mui/material/styles';
import { Stack, Typography, Tooltip, IconButton, Chip, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import { Connector } from './Connector';
import {StackProps} from "@mui/material/Stack/Stack";

export interface DocumentedConnectorProps extends StackProps {
    connector: Connector;
}

const DocumentedConnector = styled(({ connector }: DocumentedConnectorProps) => {
    const content = (
        <Stack className='width-100pct' direction='row' spacing={2}>
            <Stack className='width-100pct'>
                <Typography variant='body1'>{connector.nameWithOwner}</Typography>
                <Typography variant='body2' className='color-6b7280'>{connector.description}</Typography>
            </Stack>
            <Stack className='align-items-center' direction='row' justifyContent='flex-end' spacing={1}>
                {
                    connector.nameWithOwner.toLowerCase().startsWith('conduitio/') || connector.nameWithOwner.toLowerCase().startsWith('conduitio-labs/')
                        ? <Tooltip title="Created by the Conduit team"><img src='/img/conduit/conduit-ring.png' width='18'/></Tooltip>
                        : null
                }
                <IconButton size='small' href={connector.url} target='_blank' onClick={stopPropagation}>
                    <GitHubIcon fontSize='inherit' />
                </IconButton>
                <Chip icon={<StarIcon />} label={connector.stargazerCount} size='small' />
            </Stack>
        </Stack>
    );

    return (
        <Link
            href={connector.conduitIODocsPage}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopPropagation}
            sx={{ color: 'inherit' }}
        >
            {content}
        </Link>
    );
})(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

export default DocumentedConnector;

const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
};