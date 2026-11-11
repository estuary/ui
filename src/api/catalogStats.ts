import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    CatalogStatsBy,
    CatalogStatsGrain,
    CatalogStatsQuery,
    CatalogTaskStatsFieldsFragment,
    DocsAndBytes as GqlDocsAndBytes,
} from 'src/gql-types/graphql';

import { DateTime } from 'luxon';

import { DataGrains } from 'src/components/graphs/types';
import {
    defaultQueryDateFormat,
    LUXON_GRAIN_SETTINGS,
} from 'src/services/luxon';

export const STATS_TIMESTAMP_FORMAT = defaultQueryDateFormat;

// maps app grain -> GQL grain
const TO_GQL_GRAIN_MAP: Record<DataGrains, CatalogStatsGrain> = {
    hourly: 'HOURLY',
    daily: 'DAILY',
    monthly: 'MONTHLY',
};

// maps GQL grain -> app grain
const FROM_GQL_GRAIN_MAP: Record<CatalogStatsGrain, DataGrains> = {
    HOURLY: DataGrains.hourly,
    DAILY: DataGrains.daily,
    MONTHLY: DataGrains.monthly,
};

// combined totals for a given interval
type CatalogStatsNode =
    CatalogStatsQuery['catalogStats']['edges'][number]['node'];
// per-binding breakdown for a given interval
type CatalogTaskStatsNode = CatalogTaskStatsFieldsFragment;

interface DocsAndBytes {
    docsTotal: bigint;
    bytesTotal: bigint;
}

interface CaptureBindingStats {
    collection: string;
    lastPublishedAt: string | null;
    out: DocsAndBytes | null;
}

interface MaterializeBindingStats {
    collection: string;
    bytesBehind: bigint;
    lastSourcePublishedAt: string | null;
    right: DocsAndBytes | null;
}

export interface TaskBindingStats {
    capture: CaptureBindingStats[];
    materialize: MaterializeBindingStats[];
}

export interface CatalogStats {
    catalogName: string;
    grain: DataGrains;
    timestamp: number;
    readByMe: DocsAndBytes;
    readFromMe: DocsAndBytes;
    writtenByMe: DocsAndBytes;
    writtenToMe: DocsAndBytes;
}

// A stats interval with its per-binding breakdown in place of the totals.
// `taskStats` is null on rows that aren't a task's own, such as a collection's.
export interface CatalogTaskStats
    extends Pick<CatalogStats, 'catalogName' | 'grain' | 'timestamp'> {
    lastPublishedAt: string | null;
    taskStats: TaskBindingStats | null;
}

export interface CatalogStatsDetails {
    catalogName: string;
    grain: CatalogStats['grain'];
    timestamp: number;
    bytesRead?: number;
    docsRead?: number;
    bytesWritten?: number;
    docsWritten?: number;
}

export function toCatalogStatsBy(
    names: string | string[],
    range: DataByHourRange
): CatalogStatsBy {
    const { startDate, endDate } = convertDateRange(range);

    return {
        names: Array.isArray(names) ? names : [names],
        grain: TO_GQL_GRAIN_MAP[range.grain],
        start: startDate.toFormat(STATS_TIMESTAMP_FORMAT),
        end: endDate.toFormat(STATS_TIMESTAMP_FORMAT),
    };
}

export function toCatalogStats(node: CatalogStatsNode): CatalogStats {
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

export function toCatalogTaskStats(
    node: CatalogTaskStatsNode
): CatalogTaskStats {
    return {
        catalogName: node.catalogName,
        grain: FROM_GQL_GRAIN_MAP[node.grain],
        timestamp: DateTime.fromISO(node.timestamp).toUnixInteger(),
        lastPublishedAt: node.statsSummary.lastPublishedAt ?? null,
        taskStats: node.taskStats
            ? {
                  capture: node.taskStats.capture.map((binding) => ({
                      collection: binding.collection,
                      lastPublishedAt: binding.lastPublishedAt ?? null,
                      out: binding.out ? toDocsAndBytes(binding.out) : null,
                  })),
                  materialize: node.taskStats.materialize.map((binding) => ({
                      collection: binding.collection,
                      bytesBehind: BigInt(binding.bytesBehind),
                      lastSourcePublishedAt:
                          binding.lastSourcePublishedAt ?? null,
                      right: binding.right
                          ? toDocsAndBytes(binding.right)
                          : null,
                  })),
              }
            : null,
    };
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

function toDocsAndBytes(dnb: GqlDocsAndBytes): DocsAndBytes {
    return {
        docsTotal: BigInt(dnb.docsTotal),
        bytesTotal: BigInt(dnb.bytesTotal),
    };
}
