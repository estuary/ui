import { Box, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatHttpUrl, isHttp } from 'src/utils/dataPlane-utils';
import ExternalLink from '../ExternalLink';
import { EndpointLinkProps } from './types';

export function EndpointLink({ endpoint, hostName }: EndpointLinkProps) {
    const intl = useIntl();

    const visibility = endpoint.isPublic ? 'public' : 'private';
    const tooltip = intl.formatMessage({
        id: `taskEndpoint.visibility.${visibility}.tooltip`,
    });
    const labelMessage = `taskEndpoint.link.${visibility}.label`;

    const fullHostName = useMemo(
        () => `${endpoint.hostPrefix}.${hostName}`,
        [endpoint.hostPrefix, hostName]
    );

    let linky = null;
    if (isHttp(endpoint)) {
        const linkText = formatHttpUrl(fullHostName);

        linky = (
            <ExternalLink
                link={linkText}
                children={
                    <Typography sx={{ textTransform: 'none' }}>
                        {linkText}
                    </Typography>
                }
            />
        );
    } else {
        linky = (
            <Typography>
                {intl.formatMessage(
                    {
                        id: 'taskEndpoint.otherProtocol.message',
                    },
                    {
                        protocol: endpoint.protocol,
                        hostname: fullHostName,
                    }
                )}
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'left' }}>
            <Tooltip title={tooltip}>
                <Typography>
                    {intl.formatMessage({
                        id: labelMessage,
                    })}
                </Typography>
            </Tooltip>
            {linky}
        </Box>
    );
}
