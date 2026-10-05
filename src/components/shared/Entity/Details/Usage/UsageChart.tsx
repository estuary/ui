import type { DateTime } from 'luxon';
import type { CatalogStatsDetails } from 'src/api/catalogStats';
import type { ErrorDetails } from 'src/components/shared/Error/types';

import { Stack } from '@mui/material';

import DataByHourGraph from 'src/components/graphs/DataByHourGraph';
import EmptyGraphState from 'src/components/graphs/states/Empty';
import GraphLoadingState from 'src/components/graphs/states/Loading';
import Error from 'src/components/shared/Error';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { hasLength } from 'src/utils/misc-utils';

export interface UsageChartProps {
    data: CatalogStatsDetails[];
    error?: ErrorDetails;
    fetching: boolean;
    updatedAt: DateTime | null;
}

export function UsageChart({
    data,
    error,
    fetching,
    updatedAt,
}: UsageChartProps) {
    if (fetching && !hasLength(data)) {
        return <GraphLoadingState />;
    }

    if (error) {
        return checkErrorMessage(FAILED_TO_FETCH, error.message) ? (
            <EmptyGraphState
                header="There was a network issue."
                message="Please check your internet connection and reload the application."
            />
        ) : (
            <Error error={error} />
        );
    }

    if (!hasLength(data)) {
        return (
            <EmptyGraphState message="Unable to fetch details for data usage graph." />
        );
    }

    return (
        <Stack direction="column" spacing={1}>
            <DataByHourGraph
                id="data-by-hour_entity-details"
                stats={data}
                updatedAt={updatedAt?.toLocal().toFormat(`tt ZZZZ`)}
            />
        </Stack>
    );
}
