import type { CatalogStats } from 'src/api/catalogStats';
import type { DataByHourRange, DataGrains } from 'src/components/graphs/types';
import type { CatalogStatsQuery } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { DateTime, Interval } from 'luxon';

import {
    STATS_TIMESTAMP_FORMAT,
    toCatalogStats,
    toCatalogStatsBy,
} from 'src/api/catalogStats';
import { CATALOG_STATS_QUERY } from 'src/api/gql/catalogStats';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';
import { getCleanCatalogNames } from 'src/utils/names';

type CatalogStatsOpts = Pick<
    Parameters<typeof usePollingQuery>[0],
    'pause' | 'pollingIntervalMs' | 'requestPolicy'
>;

export function useCatalogStats(
    catalogNames: string | string[],
    range: DataByHourRange,
    opts: CatalogStatsOpts = {}
) {
    const names = useMemo(
        () => getCleanCatalogNames(catalogNames),
        [catalogNames]
    );

    const by = toCatalogStatsBy(names, range);
    const pause = opts.pause || names.length <= 0;

    const { data, error, fetching, updatedAt } = usePollingQuery({
        ...opts,
        pause,
        query: CATALOG_STATS_QUERY,
        variables: { by },
    });

    const { grain } = range;
    const { start, end } = by;
    const stats = useMemo(
        () =>
            data ? convertStatsResponse(names, data, grain, start, end) : {},
        [names, data, grain, start, end]
    );

    return { data: stats, fetching, error, updatedAt };
}

function convertStatsResponse(
    catalogNames: string[],
    data: CatalogStatsQuery,
    grain: DataGrains,
    start: string,
    end: string
) {
    const startDate = DateTime.fromFormat(start, STATS_TIMESTAMP_FORMAT, {
        zone: 'utc',
    });
    const endDate = DateTime.fromFormat(end, STATS_TIMESTAMP_FORMAT, {
        zone: 'utc',
    });
    const { relativeUnit } = LUXON_GRAIN_SETTINGS[grain];
    const interval = Interval.fromDateTimes(startDate, endDate).splitBy({
        [relativeUnit]: 1,
    });

    // accumulate the query results into a two-layer mapping for more efficient lookups
    // maps [catalogName][timestamp] -> stat
    const statsLookupMap =
        data?.catalogStats?.edges?.reduce<
            Record<string, Record<number, CatalogStats>>
        >((acc, { node }) => {
            const stat = toCatalogStats(node);
            const { catalogName, timestamp } = stat;

            acc[catalogName] ??= {};
            acc[catalogName][timestamp] = stat;
            return acc;
        }, {}) ?? {};

    // for each catalogName in the response data, iterate through the full
    // interval and fill any holes with an empty stats record
    const statsByCatalogName: Record<string, CatalogStats[]> = {};
    catalogNames.forEach((catalogName) => {
        // find the stats for this catalog, or default to empty object
        // so the interval is still fully built with empty records
        const statsByTimestamp = statsLookupMap[catalogName] ?? {};

        interval.forEach((i) => {
            if (!i.start) {
                return;
            }

            // find the matching stat, or fill with an empty record
            const timestamp = i.start.toUnixInteger();
            const stats =
                statsByTimestamp[timestamp] ??
                emptyCatalogStats(catalogName, grain, timestamp);

            statsByCatalogName[catalogName] ??= [];
            statsByCatalogName[catalogName].push(stats);
        });
    });

    return statsByCatalogName;
}

function emptyCatalogStats(
    catalogName: string,
    grain: DataGrains,
    timestamp: number
): CatalogStats {
    return {
        catalogName,
        grain,
        timestamp,
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
