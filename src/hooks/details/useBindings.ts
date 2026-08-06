import type {
    BindingCounts,
    BindingRow,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { Entity, TaskStats } from 'src/types';

import { useMemo, useRef } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getBindingStats } from 'src/api/stats';
import {
    buildBindingRows,
    countBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const EMPTY_ROWS: BindingRow[] = [];
const EMPTY_COUNTS: BindingCounts = { all: 0, enabled: 0, disabled: 0 };

interface UseBindingsResponse {
    bindings: BindingRow[];
    counts: BindingCounts;
    error: any;
    // The spec drives the rows, so they render before stats arrive; this flags
    // only that the volume columns are still filling in.
    statsLoading: boolean;
}

/**
 * A task's bindings, with their volumes over the range selected on the chart.
 *
 * One request regardless of how many bindings the task has: every row of
 * `catalog_stats` in the window carries the whole per-binding breakdown inside
 * `flow_document`, so the volume columns are sortable without further fetching.
 * The cost instead scales with intervals × bindings, which is why the caller
 * shows a loading state over these columns rather than treating them as instant.
 */
function useBindings(
    entityName: string,
    entityType: Entity,
    latestLiveSpec: LiveSpecsQuery_details | null
): UseBindingsResponse {
    const range = useDetailsUsageStore((state) => state.range);

    const { data, error, isValidating } = useQuery(
        entityName && entityType !== 'collection'
            ? getBindingStats(entityName, range)
            : null,
        // Slower than the chart's 15s on purpose: the same window costs the
        // chart four numbers per interval and costs this every binding on the
        // task, so it is not a refresh worth paying for three times a minute.
        { revalidateOnMount: true, refreshInterval: 60000 }
    );

    const intervals = useMemo(
        () =>
            data
                ? data
                      .map((row) => row.taskStats)
                      .filter((stats): stats is TaskStats => Boolean(stats))
                : null,
        [data]
    );

    // Changing the range swaps the request key, so `data` goes undefined and
    // every volume would momentarily read zero — which, because rows are sorted
    // by volume, would reshuffle the whole table and then reshuffle it back.
    // Holding the last settled stats keeps the row order still while the new
    // window loads. Nothing stale is ever *shown*: the volume cells render
    // skeletons over these values until the response lands.
    const settledIntervals = useRef<TaskStats[] | null>(null);

    if (intervals) {
        settledIntervals.current = intervals;
    }

    const bindings = useMemo(
        () =>
            buildBindingRows(
                latestLiveSpec?.spec?.bindings,
                intervals ?? settledIntervals.current,
                entityType
            ),
        [entityType, intervals, latestLiveSpec]
    );

    const counts = useMemo(
        () => (bindings.length === 0 ? EMPTY_COUNTS : countBindings(bindings)),
        [bindings]
    );

    return {
        bindings: bindings.length === 0 ? EMPTY_ROWS : bindings,
        counts,
        error,
        statsLoading: isValidating && !data,
    };
}

export default useBindings;
