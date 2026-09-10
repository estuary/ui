import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { Entity, TaskStats } from 'src/types';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getBindingStats } from 'src/api/stats';
import {
    attachBacklogReadings,
    buildBindingRows,
    combineBindingsError,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const EMPTY_ROWS: BindingRow[] = [];

interface UseBindingsResponse {
    bindings: BindingRow[];
    error: any;
    // The spec drives the rows, so they render before stats arrive; this flags
    // only that the volume columns are still filling in.
    statsLoading: boolean;
    // The lag columns arrive from a second request, independent of the one
    // `statsLoading` tracks (see `useMaterializationBacklog`), and it resolves
    // on its own schedule — often after `statsLoading` has already gone false.
    // Split in two rather than one combined flag: `bytesBehind` only waits on
    // the first (backlog) query, while `secondsBehind` additionally waits on
    // the time-lag query chained after it, so tying both columns to the
    // slower flag would hold the bytes column in a loading state past the
    // point its own data has actually arrived.
    bytesBehindLoading: boolean;
    secondsBehindLoading: boolean;
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

    const { data, error, isLoading } = useQuery(
        entityName && entityType !== 'collection'
            ? getBindingStats(entityName, range)
            : null,
        {
            // Slower than the chart's 15s on purpose: the same window costs the
            // chart four numbers per interval and costs this every binding on
            // the task, so it is not a refresh worth paying for three times a
            // minute.
            revalidateOnMount: true,
            refreshInterval: 60000,
            // Changing the range swaps the request key, so `data` would go
            // undefined and every volume would momentarily read zero — which,
            // because rows are sorted by volume, would reshuffle the whole
            // table and then reshuffle it back. Holding the previous response
            // keeps the row order still while the new window loads. Nothing
            // stale is ever *shown*: `isLoading` is still true for the new key,
            // so the volume cells render skeletons over these values.
            keepPreviousData: true,
        }
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

    const specRows = useMemo(
        () =>
            buildBindingRows(
                latestLiveSpec?.spec?.bindings,
                intervals,
                entityType
            ),
        [entityType, intervals, latestLiveSpec]
    );

    // Captures have no upstream frontier to be behind, so this only asks for a
    // materialization — passing '' for a capture leans on the same
    // `hasLength` gate `useMaterializationBacklog` already uses to skip the
    // query entirely, rather than adding a second conditional here.
    const {
        backlog,
        error: backlogError,
        loading: backlogLoading,
        timeLag,
        timeLagLoading,
    } = useMaterializationBacklog(
        entityType === 'materialization' ? entityName : ''
    );

    const bindings = useMemo(
        () => attachBacklogReadings(specRows, backlog, timeLag),
        [specRows, backlog, timeLag]
    );

    return {
        bindings: bindings.length === 0 ? EMPTY_ROWS : bindings,
        // See `combineBindingsError` for why this isn't a bare `??` here.
        error: combineBindingsError(error, backlogError),
        statsLoading: isLoading,
        bytesBehindLoading: backlogLoading,
        secondsBehindLoading: timeLagLoading,
    };
}

export default useBindings;
