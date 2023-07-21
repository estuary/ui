import { useMemo } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import { Box, Tooltip, Typography } from '@mui/material';

import CardWrapper from 'components/admin/Billing/CardWrapper';
import ExternalLink from 'components/shared/ExternalLink';

import useScopedGatewayAuthToken from 'hooks/useScopedGatewayAuthToken';
import useShardsList from 'hooks/useShardsList';

import {
    useShardDetail_getTaskEndpoints,
    useShardDetail_setShards,
    useShardDetail_shards,
} from 'stores/ShardDetail/hooks';
import { Endpoint } from 'stores/ShardDetail/types';

interface Props {
    taskName: string;
}

interface EndpointLinkProps {
    endpoint: Endpoint;
}

const isHttp = (ep: Endpoint): boolean => {
    if (ep.protocol) {
        return ep.protocol == 'h2' || ep.protocol == 'http/1.1';
    } else {
        return true;
    }
};

const httpUrl = (ep: Endpoint): string => {
    return `https://${ep.fullHostname}/`;
};

export function EndpointLink({ endpoint }: EndpointLinkProps) {
    const intl = useIntl();

    const visibility = endpoint.isPublic ? 'public' : 'private';
    const tooltip = intl.formatMessage({
        id: `taskEndpoint.visibility.${visibility}.tooltip`,
    });
    const labelMessage = `taskEndpoint.link.${visibility}.label`;

    let linky = null;
    if (isHttp(endpoint)) {
        const linkText = httpUrl(endpoint);

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
                <FormattedMessage
                    id="taskEndpoint.otherProtocol.message"
                    values={{
                        protocol: endpoint.protocol,
                        hostname: endpoint.fullHostname,
                    }}
                />
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'left' }}>
            <Tooltip title={tooltip}>
                <Typography>
                    <FormattedMessage id={labelMessage} />
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
export function TaskEndpoints({ taskName }: Props) {
    const gateway = useScopedGatewayAuthToken(taskName);
    const shards = useShardDetail_shards();
    const getTaskEndpoints = useShardDetail_getTaskEndpoints();

    const gatewayHostname = useMemo(() => {
        if (gateway.data?.gateway_url) {
            // Even though `gateway_url` is already a `URL` object, the
            // `host` property returns `null` for some $jsReason
            const url = new URL(gateway.data.gateway_url.toString());
            return url.host;
        }

        return null;
    }, [gateway.data?.gateway_url]);

    const endpoints = useMemo(() => {
        return getTaskEndpoints(taskName, gatewayHostname);
        // TODO (details) Need to make a better solution now that shards are not
        //  always loaded before details is shown
        // We need to listen to shards changing as this function relies on that
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gatewayHostname, getTaskEndpoints, taskName, shards]);

    return endpoints.length > 0 ? (
        <CardWrapper
            message={<FormattedMessage id="taskEndpoint.list.title" />}
        >
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
                {endpoints.map((ep) => {
                    return (
                        <Box
                            key={ep.fullHostname}
                            sx={{
                                gap: '10px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'left',
                                flexGrow: 1,
                            }}
                        >
                            <EndpointLink endpoint={ep} />
                        </Box>
                    );
                })}
            </Box>
        </CardWrapper>
    ) : null;
}

// Displays a short message, and possibly a link, if the task exposes any endpoints.
// The intent is to keep it short so it can fit into a small space, so only a single endpoint
// will be rendered. If the task exposes multiple endpionts, then it just shows a message
// directing the user to the task details where they can see a complete listing.
// If the task doesn't expose any endpoints, then nothing will be rendered.
export function TaskEndpoint({ taskName }: Props) {
    const gateway = useScopedGatewayAuthToken(taskName);

    // The id and spec_type are irrelevant in useShardsList, but they're required to be there.
    const listShards = useShardsList([
        { catalog_name: taskName, id: '', spec_type: 'collection' },
    ]);
    const setShards = useShardDetail_setShards();
    const getTaskEndpoints = useShardDetail_getTaskEndpoints();
    if (listShards.data) {
        setShards(listShards.data.shards);
    }

    let gatewayHostname = null;
    if (gateway.data?.gateway_url) {
        // Even though `gateway_url` is already a `URL` object, the
        // `host` property returns `null` for some $jsReason
        const url = new URL(gateway.data.gateway_url.toString());
        gatewayHostname = url.host;
    }
    const endpoints = getTaskEndpoints(taskName, gatewayHostname);

    // Only one endpoint can be rendered due to space limitations, so we
    // generally expect that the task only has one. If multiple endpoints exist
    // for the task, we'll just show a message directing the user to look at
    // the task details. Sure would be nice if we could _link_ them to the
    // details ;) We'll present the endpoint information differently depending
    // on the protocol.
    let message = null;
    if (endpoints.length === 1) {
        message = <EndpointLink endpoint={endpoints[0]} />;
    } else if (endpoints.length > 1) {
        // We really ought to link them to the details page here, but that page doesn't exist yet.
        message = (
            <Typography>
                <FormattedMessage id="taskEndpoint.multipleEndpoints.message" />
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
