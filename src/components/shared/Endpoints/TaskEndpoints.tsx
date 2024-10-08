import { Box } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import Error from 'components/shared/Error';
import { useEntityType } from 'context/EntityContext';
import { useShardEndpoints } from 'hooks/shards/useShardEndpoints';
import { useIntl } from 'react-intl';
import { EndpointLink } from './EndpointLink';
import { TaskEndpointProps } from './types';

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
