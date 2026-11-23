import type { EndpointLinkProps } from 'src/components/shared/Endpoints/types';

import { useMemo } from 'react';

import { Box, Link, Typography } from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import { formatHttpUrl, isHttp } from 'src/utils/dataPlane-utils';

export function EndpointLink({ endpoint, hostName }: EndpointLinkProps) {
    const fullHostName = useMemo(
        () => `${endpoint.hostPrefix}.${hostName}`,
        [endpoint.hostPrefix, hostName]
    );
    const publicOrPrivate = endpoint.isPublic
        ? 'Public Endpoint'
        : 'Private Endpoint';
    const linkText = formatHttpUrl(fullHostName);
    const { ref: endpointRef } = useLeaf(publicOrPrivate);

    let linky = null;
    if (isHttp(endpoint)) {
        linky = (
            <Link
                ref={endpointRef}
                href={linkText}
                target="_blank"
                rel="noopener noreferrer"
                color="secondary"
                underline="hover"
                onClick={(event) => event.stopPropagation()}
            >
                {linkText}
            </Link>
        );
    } else {
        linky = `${endpoint.protocol ?? ''} hostname: ${fullHostName}`;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'left' }}>
            <Typography>
                {publicOrPrivate}: {linky}
            </Typography>
        </Box>
    );
}
