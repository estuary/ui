import { Stack } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import HourlyRangeFilter from 'components/filters/HourRange';
import DataByHourGraph from 'components/graphs/DataByHourGraph';
import StatTypePicker from 'components/graphs/DataByHourGraph/StatTypePicker';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';
import { hasLength } from 'utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const { isValidating, stats, error } = useDetailsStats(
        catalogName,
        'hourly'
    );

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <HourlyRangeFilter />
                    <StatTypePicker />
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
                <DataByHourGraph
                    id="data-by-hour_entity-details"
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

export default Usage;
