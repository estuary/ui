import type { StatsBatches } from 'src/api/catalogStats';
import type {
    CatalogStatsGrain,
    TaskUsageStatsFieldsFragment,
} from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { chunk } from 'lodash';
import { DateTime } from 'luxon';

import {
    buildStatsBatchQuery,
    STATS_TIMESTAMP_FORMAT,
} from 'src/api/catalogStats';
import { TASK_USAGE_STATS_FRAGMENT } from 'src/api/gql/billingUsage';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';

// The limits of one `catalogStats` call. Past the bucket cap the server
// returns an error rather than a truncated result.
const MAX_NAMES_PER_CALL = 100;
const MAX_BUCKETS_PER_CALL = 10_000;

export type UsageGrain = Extract<CatalogStatsGrain, 'DAILY' | 'MONTHLY'>;

// A half-open window whose ends fall on UTC `grain` boundaries.
export interface StatsWindow {
    grain: UsageGrain;
    start: DateTime;
    end: DateTime;
}

export interface UsageAmounts {
    bytes: number;
    seconds: number;
}

// Catalog name -> start date of a bucket (yyyy-MM-dd) -> what it used.
export type UsageStats = Map<string, Map<string, UsageAmounts>>;

export const countWindowBuckets = ({ grain, start, end }: StatsWindow) => {
    const unit = grain === 'DAILY' ? 'days' : 'months';
    return Math.ceil(end.diff(start, unit).as(unit));
};

// Groups names so that no call passes either cap, assuming every name has a
// bucket at each step of the window.
export function batchStatsNames(
    names: string[],
    bucketsPerName: number
): string[][] {
    const size = Math.min(
        MAX_NAMES_PER_CALL,
        Math.max(1, Math.floor(MAX_BUCKETS_PER_CALL / bucketsPerName))
    );

    return chunk(names, size);
}

const toUsageStats = (data: StatsBatches<TaskUsageStatsFieldsFragment>) => {
    const stats: UsageStats = new Map();

    Object.values(data).forEach((batch) => {
        batch?.edges.forEach(({ node }) => {
            const { readByMe, writtenByMe, usageSeconds } = node.statsSummary;
            const bucket = DateTime.fromISO(node.timestamp, {
                zone: 'utc',
            }).toISODate();

            if (!bucket) {
                return;
            }

            if (!stats.has(node.catalogName)) {
                stats.set(node.catalogName, new Map());
            }

            stats.get(node.catalogName)?.set(bucket, {
                bytes:
                    Number(readByMe.bytesTotal) +
                    Number(writtenByMe.bytesTotal),
                seconds: Number(usageSeconds),
            });
        });
    });

    return stats;
};

// Each name's usage per bucket of the window, read in as few `catalogStats`
// calls as the caps allow, all sent in one request.
export function useTaskUsageStats(
    names: string[],
    window: StatsWindow,
    pause = false
) {
    const batches = batchStatsNames(names, countWindowBuckets(window));
    // At least one batch, so the query stays valid while paused with no names
    const batchCount = Math.max(batches.length, 1);

    const query = useMemo(
        () =>
            buildStatsBatchQuery(
                'TaskUsageStatsBatch',
                TASK_USAGE_STATS_FRAGMENT,
                batchCount
            ),
        [batchCount]
    );

    const start = window.start.toFormat(STATS_TIMESTAMP_FORMAT);
    const end = window.end.toFormat(STATS_TIMESTAMP_FORMAT);
    const variables = Object.fromEntries(
        Array.from({ length: batchCount }, (_, index) => [
            `vars_${index}`,
            {
                names: batches[index] ?? [],
                grain: window.grain,
                start,
                end,
            },
        ])
    );

    const { data, error } = usePollingQuery({
        query,
        variables,
        pause: pause || names.length === 0,
    });

    const stats = useMemo(
        () => (data && !error ? toUsageStats(data) : undefined),
        [data, error]
    );

    return { stats, error };
}
