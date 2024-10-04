import { Box, Tooltip, Typography } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import Error from 'components/shared/Error';
import ExternalLink from 'components/shared/ExternalLink';
import { useEntityType } from 'context/EntityContext';
import { useShardEndpoints } from 'hooks/shards/useShardEndpoints';
import useShardHydration from 'hooks/shards/useShardHydration';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Endpoint } from 'stores/ShardDetail/types';

interface Props {
    reactorAddress: string | undefined;
    taskName: string;
}

interface EndpointLinkProps {
    endpoint: Endpoint;
    hostName: string | null;
}

const isHttp = (ep: Endpoint): boolean => {
    if (ep.protocol) {
        return ep.protocol == 'h2' || ep.protocol == 'http/1.1';
    } else {
        return true;
    }
};

const httpUrl = (fullHostName: string): string => {
    return `https://${fullHostName}/`;
};

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
        const linkText = httpUrl(fullHostName);

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

// TODO (task endpoints) This was designed to quickly get added to the old
//  details panel inside the tables. It was pretty constrained in there and
//  didn't have a specific design language. I think now that the details page
//  exists and has other lists we should work on getting this redesigned to
//  make the experience better and consistent.
export function TaskEndpoints({ reactorAddress, taskName }: Props) {
    const intl = useIntl();
    const entityType = useEntityType();

    const { endpoints, gatewayHostname } = useShardEndpoints(
        taskName,
        [entityType],
        reactorAddress
    );

    return endpoints.length > 0 ? (
        <CardWrapper
            message={intl.formatMessage({ id: 'taskEndpoint.list.title' })}
        >
            {typeof reactorAddress === 'string' &&
            typeof gatewayHostname !== 'string' ? (
                <Error
                    condensed
                    error={{
                        message: 'details.taskEndpoints.error.message',
                    }}
                    hideTitle
                />
            ) : (
                <Box
                    sx={{
                        gap: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        justifyContent: 'left',
                        flexGrow: 1,
                    }}
                >
                    {endpoints.map((ep, index) => {
                        return (
                            <Box
                                key={`${ep.fullHostname}_${index}`}
                                sx={{
                                    gap: '10px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'left',
                                    flexGrow: 1,
                                }}
                            >
                                <EndpointLink
                                    endpoint={ep}
                                    hostName={gatewayHostname}
                                />
                            </Box>
                        );
                    })}
                </Box>
            )}
        </CardWrapper>
    ) : null;
}

// Displays a short message, and possibly a link, if the task exposes any endpoints.
// The intent is to keep it short so it can fit into a small space, so only a single endpoint
// will be rendered. If the task exposes multiple endpoints, then it just shows a message
// directing the user to the task details where they can see a complete listing.
// If the task doesn't expose any endpoints, then nothing will be rendered.
export function TaskEndpoint({ reactorAddress, taskName }: Props) {
    const intl = useIntl();

    // The id and spec_type are irrelevant in useShardsList, but they're required to be there.
    useShardHydration([taskName]);

    const entityType = useEntityType();
    const { endpoints, gatewayHostname } = useShardEndpoints(
        taskName,
        [entityType],
        reactorAddress
    );

    // Only one endpoint can be rendered due to space limitations, so we
    // generally expect that the task only has one. If multiple endpoints exist
    // for the task, we'll just show a message directing the user to look at
    // the task details. Sure would be nice if we could _link_ them to the
    // details ;) We'll present the endpoint information differently depending
    // on the protocol.
    let message = null;
    if (endpoints.length === 1) {
        message = (
            <EndpointLink endpoint={endpoints[0]} hostName={gatewayHostname} />
        );
    } else if (endpoints.length > 1) {
        // TODO (task endpoints) We really ought to link them to the details page here, but that page doesn't exist yet.
        message = (
            <Typography>
                {intl.formatMessage({
                    id: 'taskEndpoint.multipleEndpoints.message',
                })}
            </Typography>
        );
    }

    return message ? (
        <Box
            sx={{
                gap: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                flexGrow: 1,
            }}
        >
            {message}
        </Box>
    ) : null;
}
