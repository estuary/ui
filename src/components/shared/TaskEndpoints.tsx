import { Box, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import useScopedGatewayAuthToken from 'hooks/useScopedGatewayAuthToken';
import useShardsList from 'hooks/useShardsList';
import { FormattedMessage } from 'react-intl';
import {
    useShardDetail_getTaskEndpoints,
    useShardDetail_setShards,
} from 'stores/ShardDetail/hooks';
import { Endpoint } from 'stores/ShardDetail/types';

interface Props {
    taskName: string;
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

export function TaskEndpoint({ taskName }: Props) {
    const gateway = useScopedGatewayAuthToken([taskName]);

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
    if (endpoints.length === 1 && isHttp(endpoints[0])) {
        const linkText = httpUrl(endpoints[0]);
        // ExternalLink will uppercase the text by default, so we explicitly pass `testTransform: none`
        message = (
            <ExternalLink
                link={linkText}
                children={
                    <Typography sx={{ textTransform: 'none' }}>
                        {linkText}
                    </Typography>
                }
            />
        );
    } else if (endpoints.length === 1) {
        message = (
            <Typography>
                <FormattedMessage
                    id="taskEndpoint.otherProtocol.message"
                    values={{
                        protocol: endpoints[0].protocol,
                        hostname: endpoints[0].fullHostname,
                    }}
                />
            </Typography>
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
            <Typography component="h3">
                <FormattedMessage
                    id="taskEndpoint.http.message"
                    values={{ taskName }}
                />
            </Typography>
            {message}
        </Box>
    ) : null;
}
