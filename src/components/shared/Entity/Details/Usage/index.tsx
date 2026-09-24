import { Stack } from '@mui/material';

import DetailsRange from 'src/components/filters/DetailsRange';
import DataByHourGraph from 'src/components/graphs/DataByHourGraph';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import CardWrapper from 'src/components/shared/CardWrapper';
import DelayWarning from 'src/components/shared/Entity/Details/Usage/DelayWarning';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import { useDetailsStats } from 'src/hooks/catalogStats/useDetailsStats';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const entityType = useEntityType();
    const response = useDetailsStats(entityType, catalogName);

    const { stats, fetching, error, updatedAt } = response;
    const updatedAtStr = updatedAt.toLocal().toFormat(`tt ZZZZ`);

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <DetailsRange />
                    <StatTypeSelector />
                </Stack>
            }
        >
            {fetching && !hasLength(stats) ? (
                <GraphLoadingState />
            ) : error ? (
                checkErrorMessage(FAILED_TO_FETCH, error.message) ? (
                    <EmptyGraphState
                        header="There was a network issue."
                        message="Please check your internet connection and reload the application."
                    />
                ) : (
                    <Error error={error} />
                )
            ) : hasLength(stats) ? (
                <Stack direction="column" spacing={1}>
                    <DataByHourGraph
                        id="data-by-hour_entity-details"
                        stats={stats}
                        updatedAt={updatedAtStr}
                    />
                </Stack>
            ) : (
                <EmptyGraphState message="Unable to fetch details for data usage graph." />
            )}

            <DelayWarning />
        </CardWrapper>
    );
}

export default Usage;
