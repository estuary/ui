import { Stack } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import HourlyRangeFilter from 'components/filters/HourRange';
import DataByHourGraph from 'components/graphs/DataByHourGraph';
import StatTypePicker from 'components/graphs/DataByHourGraph/DataTypePicker';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import { DataByHourRange, DataByHourStatType } from 'components/graphs/types';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';
import { hasLength } from 'utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const [range, setRange] = useState<DataByHourRange>(6);
    const [statType, setStatType] = useState<DataByHourStatType>('bytes');

    const { isValidating, stats, error } = useDetailsStats(
        catalogName,
        'hourly',
        { hours: range }
    );

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <HourlyRangeFilter range={range} setRange={setRange} />
                    <StatTypePicker
                        statType={statType}
                        setStatType={setStatType}
                    />
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
                    statType={statType}
                    range={range}
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
