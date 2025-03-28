import type { TaskEndpointProps } from 'src/components/shared/Endpoints/types';

import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import { EndpointLink } from 'src/components/shared/Endpoints/EndpointLink';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import { useShardEndpoints } from 'src/hooks/shards/useShardEndpoints';

// TODO (task endpoints) This was designed to quickly get added to the old
//  details panel inside the tables. It was pretty constrained in there and
//  didn't have a specific design language. I think now that the details page
//  exists and has other lists we should work on getting this redesigned to
//  make the experience better and consistent.
export function TaskEndpoints({ reactorAddress, taskName }: TaskEndpointProps) {
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
