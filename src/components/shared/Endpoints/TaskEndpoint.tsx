import type { TaskEndpointProps } from 'src/components/shared/Endpoints/types';

import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { EndpointLink } from 'src/components/shared/Endpoints/EndpointLink';
import { useEntityType } from 'src/context/EntityContext';
import { useShardEndpoints } from 'src/hooks/shards/useShardEndpoints';
import useShardHydration from 'src/hooks/shards/useShardHydration';

// Displays a short message, and possibly a link, if the task exposes any endpoints.
// The intent is to keep it short so it can fit into a small space, so only a single endpoint
// will be rendered. If the task exposes multiple endpoints, then it just shows a message
// directing the user to the task details where they can see a complete listing.
// If the task doesn't expose any endpoints, then nothing will be rendered.
export function TaskEndpoint({ reactorAddress, taskName }: TaskEndpointProps) {
    const intl = useIntl();

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

    if (!message) {
        return null;
    }

    return (
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
    );
}
