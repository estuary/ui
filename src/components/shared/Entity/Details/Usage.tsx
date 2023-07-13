import CardWrapper from 'components/admin/Billing/CardWrapper';
import HourlyRangeFilter from 'components/filters/HourRange';
import DataByHourGraph from 'components/graphs/DataByHourGraph';
import GraphLoadingState from 'components/graphs/states/Loading';
import { DataByHourRange } from 'components/graphs/types';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { useState } from 'react';
import { hasLength } from 'utils/misc-utils';

interface Props {
    catalogName: string;
    createdAt?: string;
}

function Usage({ catalogName }: Props) {
    const [range, setRange] = useState<DataByHourRange>(6);

    const { isValidating, stats, error } = useDetailsStats(catalogName, range);
    const statsPopulated = hasLength(stats);

    return (
        <CardWrapper
            height={undefined}
            message={<HourlyRangeFilter range={range} setRange={setRange} />}
        >
            {isValidating && !statsPopulated ? (
                <GraphLoadingState />
            ) : error ? (
                <Error error={error} />
            ) : (
                <DataByHourGraph stats={stats} range={range} />
            )}
        </CardWrapper>
    );
}

export default Usage;
