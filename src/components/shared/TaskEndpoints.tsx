import { Box, Tooltip, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import useScopedGatewayAuthToken from 'hooks/useScopedGatewayAuthToken';
import useShardsList from 'hooks/useShardsList';
import { LockedWindow, NoLock } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useShardDetail_getTaskEndpoints,
    useShardDetail_setShards,
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
    const privacyIcon = endpoint.isPublic ? <NoLock /> : <LockedWindow />;

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
            <Tooltip title={tooltip}>{privacyIcon}</Tooltip>
            {linky}
        </Box>
    );
}

export function TaskEndpoints({ taskName }: Props) {
    const gateway = useScopedGatewayAuthToken(taskName);

    const getTaskEndpoints = useShardDetail_getTaskEndpoints();

    let gatewayHostname = null;
    if (gateway.data?.gateway_url) {
        // Even though `gateway_url` is already a `URL` object, the
        // `host` property returns `null` for some $jsReason
        const url = new URL(gateway.data.gateway_url.toString());
        gatewayHostname = url.host;
    }
    const endpoints = getTaskEndpoints(taskName, gatewayHostname);

    return endpoints.length > 0 ? (
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
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                <FormattedMessage id="taskEndpoint.list.title" />
            </Typography>
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
        message = (
            <>
                <Typography component="h3">
                    <FormattedMessage
                        id="taskEndpoint.single.title"
                        values={{ taskName }}
                    />
                </Typography>
                <EndpointLink endpoint={endpoints[0]} />
            </>
        );
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
