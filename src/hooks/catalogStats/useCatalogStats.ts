import type { CatalogStats } from 'src/api/gql/catalogStats';
import type { DataByHourRange, DataGrains } from 'src/components/graphs/types';
import type {
    CatalogStatsBy,
    CatalogStatsGrain,
    CatalogStatsQuery,
} from 'src/gql-types/graphql';

import { useMemo, useState } from 'react';

import { DateTime, Interval } from 'luxon';
import { useInterval } from 'react-use';
import { useQuery } from 'urql';

import { CATALOG_STATS_QUERY, toCatalogStats } from 'src/api/gql/catalogStats';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';

const STATS_TIMESTAMP_FORMAT = `yyyy-MM-dd'T'HH:mm:ssZZ`;

// maps app grain -> GQL grain
const GRAIN_MAP: Record<DataGrains, CatalogStatsGrain> = {
    hourly: 'HOURLY',
    daily: 'DAILY',
    monthly: 'MONTHLY',
};

export function usePollCatalogStats(
    names: string[],
    range: DataByHourRange,
    intervalMs: number
) {
    const namesClean = names.filter((n) => !!n);
    const by = toCatalogStatsBy(namesClean, range);
    const [updatedAt, setUpdatedAt] = useState<DateTime>(DateTime.now());

    const [{ data, error, fetching }, reexecuteQuery] = useQuery({
        query: CATALOG_STATS_QUERY,
        requestPolicy: 'network-only',
        variables: { by },
        pause: namesClean.length <= 0,
    });

    const stats = useMemo(() => {
        return convertStatsResponse(range, data);
    }, [range, data]);

    useInterval(() => {
        if (fetching || namesClean.length <= 0) {
            return;
        }

        const by = toCatalogStatsBy(namesClean, range);
        reexecuteQuery({
            requestPolicy: 'network-only',
            variables: { by },
        });

        setUpdatedAt(DateTime.now());
    }, intervalMs);

    return { data: stats, fetching, error, updatedAt };
}

function toCatalogStatsBy(
    names: string[],
    range: DataByHourRange
): CatalogStatsBy {
    const { grain, start, end } = convertDateRange(range);

    return {
        names,
        grain,
        start: start.toFormat(STATS_TIMESTAMP_FORMAT),
        end: end.toFormat(STATS_TIMESTAMP_FORMAT),
    };
}

function convertDateRange(range: DataByHourRange) {
    const { relativeUnit, timeUnit } = LUXON_GRAIN_SETTINGS[range.grain];
    const grain = GRAIN_MAP[range.grain] ?? 'HOURLY';

    const end = DateTime.utc()
        .plus({ [timeUnit]: 1 })
        .startOf(timeUnit);
    const start = end.minus({
        [relativeUnit]: range.amount,
    });

    return { grain, start, end };
}

function convertStatsResponse(
    range: DataByHourRange,
    data?: CatalogStatsQuery
) {
    const { relativeUnit } = LUXON_GRAIN_SETTINGS[range.grain];
    const { start, end } = convertDateRange(range);
    const interval = Interval.fromDateTimes(start, end).splitBy({
        [relativeUnit]: 1,
    });

    // accumulate the query results into a two-layer mapping for more efficient lookups
    // maps [catalogName][timestamp] -> stat
    const statsLookupMap =
        data?.catalogStats?.edges?.reduce(
            (acc, { node }) => {
                const { catalogName, timestamp } = node;
                const stat = toCatalogStats(node);

                acc[catalogName] ??= {};
                acc[catalogName][timestamp] = stat;
                return acc;
            },
            {} as Record<string, Record<string, CatalogStats>>
        ) ?? {};

    // for each catalogName in the response data, iterate through the full
    // interval and fill any holes with an empty stats record
    const statsByCatalogName: Record<string, CatalogStats[]> = {};
    Object.entries(statsLookupMap).forEach(
        ([catalogName, statsByTimestamp]) => {
            interval.map((i) => {
                const timestamp = i.start?.toFormat(STATS_TIMESTAMP_FORMAT);
                if (!timestamp) {
                    return;
                }

                // find the matching stat, or fill with an empty record
                const stats =
                    statsByTimestamp[timestamp] ??
                    emptyCatalogStats(catalogName, timestamp, range);

                statsByCatalogName[catalogName] ??= [];
                statsByCatalogName[catalogName].push(stats);
            });
        }
    );

    return statsByCatalogName;
}

function emptyCatalogStats(
    catalogName: string,
    timestamp: string,
    range: DataByHourRange
): CatalogStats {
    return {
        catalogName,
        timestamp,
        grain: range.grain,
        readByMe: {
            docsTotal: BigInt(0),
            bytesTotal: BigInt(0),
        },
        readFromMe: {
            docsTotal: BigInt(0),
            bytesTotal: BigInt(0),
        },
        writtenByMe: {
            docsTotal: BigInt(0),
            bytesTotal: BigInt(0),
        },
        writtenToMe: {
            docsTotal: BigInt(0),
            bytesTotal: BigInt(0),
        },
    };
}
