import { Stack } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import DynamicRangeFilter from 'components/filters/DynamicRange';
import DataByDurationGraph from 'components/graphs/DataByDurationGraph';
import StatTypeSelector from 'components/graphs/DataByDurationGraph/StatTypeSelector';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import useDashboardStats from 'hooks/useDashboardStats';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';
import { hasLength } from 'utils/misc-utils';

export default function DataTrendsGraph() {
    const { isValidating, stats, error } = useDashboardStats('melk');

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <DynamicRangeFilter />
                    <StatTypeSelector />
                </Stack>
            }
        >
            {isValidating && !stats ? (
                <GraphLoadingState />
            ) : error ? (
                checkErrorMessage(FAILED_TO_FETCH, error.message) ? (
                    <EmptyGraphState
                        header={
                            <FormattedMessage id="entityTable.networkFailed.header" />
                        }
                        message={
                            <FormattedMessage id="entityTable.networkFailed.message" />
                        }
                    />
                ) : (
                    <Error error={error} />
                )
            ) : hasLength(stats) ? (
                <DataByDurationGraph
                    id="data-by-duration_dashboard"
                    stats={stats}
                />
            ) : (
                <EmptyGraphState
                    message={
                        <FormattedMessage id="graphs.entityDetails.empty.message" />
                    }
                />
            )}
        </CardWrapper>
    );
}
