import type {
    BindingRow,
    BindingTaskStats,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { Entity } from 'src/types';

import { useMemo, useState } from 'react';

import { CATALOG_TASK_STATS_QUERY } from 'src/api/gql/catalogStats';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import {
    attachBacklogReadings,
    buildBindingRows,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { toCatalogStatsBy } from 'src/hooks/catalogStats/useCatalogStats';
import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const EMPTY_ROWS: BindingRow[] = [];

interface UseBindingsResponse {
    bindings: BindingRow[];
    error: any;
    // The spec drives the rows, so they render before stats arrive; this flags
    // only that the volume columns are still filling in.
    statsLoading: boolean;
    // The stats request settled without data (it failed), so every volume
    // reads zero. Callers must not take that as "this binding moved nothing".
    volumesUnavailable: boolean;
    // Two flags rather than one: `bytesBehind` waits only on the backlog query,
    // while `secondsBehind` also waits on the time-lag query chained after it.
    bytesBehindLoading: boolean;
    secondsBehindLoading: boolean;
}

/**
 * A task's bindings, with their volumes over the range selected on the chart.
 *
 * One request regardless of how many bindings the task has: every interval of
 * `catalogStats` in the window carries the whole per-binding breakdown in
 * `taskStats`, so the volume columns are sortable without further fetching.
 * The cost instead scales with intervals × bindings, which is why the caller
 * shows a loading state over these columns rather than treating them as instant.
 */
export function useBindings(
    entityName: string,
    entityType: Entity,
    latestLiveSpec: LiveSpecsQuery_details | null
): UseBindingsResponse {
    const range = useDetailsUsageStore((state) => state.range);

    const { data, error, fetching } = usePollingQuery({
        query: CATALOG_TASK_STATS_QUERY,
        pause: !entityName || entityType === 'collection',
        // Slower than the chart's 15s: the same window costs the chart four
        // numbers per interval and costs this every binding.
        pollingIntervalMs: 60000,
        variables: { by: toCatalogStatsBy([entityName], range) },
    });

    // `usePollingQuery` drops the data while a new range loads, which would
    // zero every volume and reshuffle the volume-sorted table. Hold the last
    // result instead; the cells render skeletons over it meanwhile.
    const [retained, setRetained] = useState(data);
    if (data && data !== retained) {
        setRetained(data);
    }

    const statsLoading = fetching && !data;
    const current = data ?? (statsLoading ? retained : undefined);

    const intervals = useMemo(
        () =>
            current
                ? current.catalogStats.edges
                      .map(({ node }) => node.taskStats)
                      .filter((stats): stats is BindingTaskStats =>
                          Boolean(stats)
                      )
                : null,
        [current]
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

    // Captures have no upstream frontier to be behind. Passing '' leans on the
    // `hasLength` gate `useMaterializationBacklog` already uses to skip it.
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
        // A failed backlog fetch leaves the lag columns at null, which renders
        // as "no reading" rather than an error, so it has to surface here too.
        error: error ?? backlogError,
        statsLoading,
        volumesUnavailable: !statsLoading && intervals === null,
        bytesBehindLoading: backlogLoading,
        secondsBehindLoading: timeLagLoading,
    };
}
