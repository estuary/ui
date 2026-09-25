import type { CatalogStats, DocsAndBytes } from 'src/api/catalogStats';
import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    CatalogStatsGrain,
    CatalogStatsQuery,
} from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { DateTime, Interval } from 'luxon';

import { CATALOG_STATS_QUERY } from 'src/api/gql/catalogStats';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { DataGrains } from 'src/components/graphs/types';
import {
    defaultQueryDateFormat,
    LUXON_GRAIN_SETTINGS,
} from 'src/services/luxon';

type CatalogStatsNode =
    CatalogStatsQuery['catalogStats']['edges'][number]['node'];
type GqlDocsAndBytes = CatalogStatsNode['statsSummary']['readByMe'];

const STATS_TIMESTAMP_FORMAT = defaultQueryDateFormat;

// maps GQL grain -> app grain
const FROM_GQL_GRAIN_MAP: Record<CatalogStatsGrain, DataGrains> = {
    HOURLY: DataGrains.hourly,
    DAILY: DataGrains.daily,
    MONTHLY: DataGrains.monthly,
};
// maps app grain -> GQL grain
const TO_GQL_GRAIN_MAP: Record<DataGrains, CatalogStatsGrain> = {
    hourly: 'HOURLY',
    daily: 'DAILY',
    monthly: 'MONTHLY',
};

type CatalogStatsOpts = {
    pollingIntervalMs?: number;
};

export function useCatalogStats(
    catalogNames: string[],
    range: DataByHourRange,
    opts: CatalogStatsOpts = {}
) {
    const { grain, startDate, endDate } = convertDateRange(range);
    const start = startDate.toFormat(STATS_TIMESTAMP_FORMAT);
    const end = endDate.toFormat(STATS_TIMESTAMP_FORMAT);
    const { pollingIntervalMs } = opts;

    const gqlGrain = TO_GQL_GRAIN_MAP[range.grain];
    const names = catalogNames.filter(Boolean);
    const hasNames = names.length > 0;

    const { data, error, fetching, updatedAt } = usePollingQuery({
        query: CATALOG_STATS_QUERY,
        pause: !hasNames,
        requestPolicy: 'network-only',
        pollingIntervalMs,
        variables: {
            by: {
                names,
                grain: gqlGrain,
                start,
                end,
            },
        },
    });

    const stats = useMemo(() => {
        return data ? convertStatsResponse(data, grain, start, end) : {};
    }, [data, grain, start, end]);

    return { data: stats, fetching, error, updatedAt };
}

function convertDateRange(range: DataByHourRange) {
    const { relativeUnit, timeUnit } = LUXON_GRAIN_SETTINGS[range.grain];

    const endDate = DateTime.utc()
        .plus({ [timeUnit]: 1 })
        .startOf(timeUnit);
    const startDate = endDate.minus({
        [relativeUnit]: range.amount,
    });

    return {
        grain: range.grain,
        startDate,
        endDate,
    };
}

function convertStatsResponse(
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
        data?.catalogStats?.edges?.reduce(
            (acc, { node }) => {
                const stat = toCatalogStats(node);
                const { catalogName, timestamp } = stat;

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
        }
    );

    return statsByCatalogName;
}

function toCatalogStats(node: CatalogStatsNode): CatalogStats {
    return {
        catalogName: node.catalogName,
        grain: FROM_GQL_GRAIN_MAP[node.grain],
        timestamp: DateTime.fromISO(node.timestamp).toUnixInteger(),
        readByMe: toDocsAndBytes(node.statsSummary.readByMe),
        readFromMe: toDocsAndBytes(node.statsSummary.readFromMe),
        writtenByMe: toDocsAndBytes(node.statsSummary.writtenByMe),
        writtenToMe: toDocsAndBytes(node.statsSummary.writtenToMe),
    };
}

function toDocsAndBytes(dnb: GqlDocsAndBytes): DocsAndBytes {
    return {
        docsTotal: BigInt(dnb.docsTotal),
        bytesTotal: BigInt(dnb.bytesTotal),
    };
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
