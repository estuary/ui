import type { Entity } from 'src/types';

import { Stack } from '@mui/material';

import DetailsRange from 'src/components/filters/DetailsRange';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import CardWrapper from 'src/components/shared/CardWrapper';
import DelayWarning from 'src/components/shared/Entity/Details/Usage/DelayWarning';
import { UsageChart } from 'src/components/shared/Entity/Details/Usage/UsageChart';
import { useEntityType } from 'src/context/EntityContext';
import { useDetailsStats } from 'src/hooks/catalogStats/useDetailsStats';
import { useDetailsStatsGql } from 'src/hooks/catalogStats/useDetailsStatsGql';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

// Hand-typed debug flag, so accept the spellings someone is likely to reach
// for. A bare `?gqlStats` reads as an empty string and counts as opting in.
const ENABLED_VALUES = new Set(['', '1', 'true', 'yes']);

interface Props {
    catalogName: string;
    createdAt?: string;
}

interface ChartProps {
    catalogName: string;
    entityType: Entity;
}

function Usage({ catalogName }: Props) {
    const entityType = useEntityType();
    const gqlEnabled = useGqlStatsEnabled();

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
            {gqlEnabled ? (
                <GqlUsageChart
                    catalogName={catalogName}
                    entityType={entityType}
                />
            ) : (
                <PostgrestUsageChart
                    catalogName={catalogName}
                    entityType={entityType}
                />
            )}

            <DelayWarning />
        </CardWrapper>
    );
}

function useGqlStatsEnabled() {
    const flag = useGlobalSearchParams(GlobalSearchParams.GQL_STATS);
    return flag !== null && ENABLED_VALUES.has(flag.toLowerCase());
}

function GqlUsageChart({ catalogName, entityType }: ChartProps) {
    const stats = useDetailsStatsGql(entityType, catalogName);
    return <UsageChart {...stats} />;
}

// TODO (adrian): remove once gql stats are verified in prod
function PostgrestUsageChart({ catalogName, entityType }: ChartProps) {
    const stats = useDetailsStats(entityType, catalogName);
    return <UsageChart {...stats} />;
}

export default Usage;
