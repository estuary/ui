import { Stack, Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import HourlyRangeFilter from 'components/filters/HourRange';
import DataByHourGraph from 'components/graphs/DataByHourGraph';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import { tooltipSX } from 'components/graphs/tooltips';
import { DataByHourRange } from 'components/graphs/types';
import Error from 'components/shared/Error';
import useDetailsStats from 'hooks/useDetailsStats';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    catalogName: string;
}

function Usage({ catalogName }: Props) {
    const { isValidating, stats, error } = useDetailsStats(catalogName);
    const statsPopulated = hasLength(stats);

    const [range, setRange] = useState<DataByHourRange>(6);

    return (
        <Stack direction="column" spacing={2} sx={{ ...tooltipSX, m: 2 }}>
            <Stack direction="row" spacing={1}>
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <FormattedMessage id="detailsPanel.dataUsage.title" />
                </Typography>
            </Stack>
            {isValidating && !statsPopulated ? (
                <GraphLoadingState />
            ) : error ? (
                <Error error={error} />
            ) : !statsPopulated ? (
                <EmptyGraphState
                    message={
                        <FormattedMessage id="graphs.entityDetails.empty.message" />
                    }
                />
            ) : (
                <CardWrapper
                    message={
                        <HourlyRangeFilter range={range} setRange={setRange} />
                    }
                >
                    <DataByHourGraph stats={stats} range={range} />
                </CardWrapper>
            )}
        </Stack>
    );
}

export default Usage;
