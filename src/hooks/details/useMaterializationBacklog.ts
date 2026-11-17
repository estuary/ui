import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    MaterializationBacklog,
    MaterializationTimeLag,
} from 'src/hooks/details/shared';

import { useMemo } from 'react';

import { DataGrains } from 'src/components/graphs/types';
import { useCatalogTaskStats } from 'src/hooks/catalogStats/useCatalogTaskStats';
import {
    computeMaterializationTimeLag,
    latestPublishedByCollection,
    parseMaterializationBacklog,
} from 'src/hooks/details/shared';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';

const POLLING_INTERVAL_MS = 60000;

// 48 hours covers an idle or paused task that hasn't reported recently.
// Grain needs to be hourly, not daily, since a zero `bytesBehind` is left
// out of the stats, so a daily row keeps the day's last nonzero reading after
// the task catches up.
const BACKLOG_RANGE: DataByHourRange = { grain: DataGrains.hourly, amount: 48 };

// `lastPublishedAt` reduces by maximizing, so a month's row already holds the
// latest publication within that month; two months of rows place the frontier
// of any collection still being written to.
const LAST_PUBLISHED_RANGE: DataByHourRange = {
    grain: DataGrains.monthly,
    amount: 2,
};

// How far behind a materialization is, in bytes and in time
export function useMaterializationBacklog(
    catalogName: string,
    boundCollections: string[]
) {
    const {
        backlog,
        error: backlogError,
        loading: backlogLoading,
    } = useBacklog(catalogName, boundCollections);

    const { timeLag, loading: timeLagLoading } = useTimeLag(
        catalogName,
        boundCollections,
        backlog,
        backlogLoading
    );

    return {
        backlog,
        backlogLoading,
        backlogError,
        timeLag,
        timeLagLoading,
    };
}

// The task's bytes behind, from its newest hourly stats row that describes
// its bindings
function useBacklog(catalogName: string, boundCollections: string[]) {
    // The window moves every hour; `useCatalogTaskStats` keeps the last result
    // meanwhile, so the backlog doesn't blank out
    const { data, error, fetching } = useCatalogTaskStats(
        catalogName,
        BACKLOG_RANGE,
        {
            pause: !catalogName,
            pollingIntervalMs: POLLING_INTERVAL_MS,
        }
    );

    const backlog = useMemo<MaterializationBacklog | null>(
        () =>
            data ? parseMaterializationBacklog(data, boundCollections) : null,
        [boundCollections, data]
    );

    // True only until the first response lands. A background refresh leaves this
    // false, so a value already on screen is never replaced by a loading state.
    const loading = fetching && !data;

    return { backlog, error, loading };
}

// How long ago each source collection was published past where its binding
// has read up to. Fetched alongside the backlog, since the names come from the
// spec rather than the backlog result.
function useTimeLag(
    catalogName: string,
    boundCollections: string[],
    backlog: MaterializationBacklog | null,
    backlogLoading: boolean
) {
    // `catalogStats` rejects the whole request if any name is unreadable, so
    // only ask for source collections the user can read (a read-only user
    // may not reach a collection shared with the task's prefix). No task
    // means no names, so the query stays paused.
    const readablePrefixes = useEntitiesStore_capabilities_readable();

    const collectionNames = useMemo(
        () =>
            catalogName
                ? boundCollections.filter((name) =>
                      readablePrefixes.some((prefix) => name.startsWith(prefix))
                  )
                : [],
        [boundCollections, catalogName, readablePrefixes]
    );

    const { data, fetching } = useCatalogTaskStats(
        collectionNames,
        LAST_PUBLISHED_RANGE,
        { pollingIntervalMs: POLLING_INTERVAL_MS }
    );

    const timeLag = useMemo<MaterializationTimeLag | null>(() => {
        if (!backlog || !data) {
            return null;
        }

        return computeMaterializationTimeLag(
            backlog.bindings,
            latestPublishedByCollection(data)
        );
    }, [backlog, data]);

    // The lag is computed against the backlog, so it waits on both
    const loading = backlogLoading || (fetching && !data);

    return { timeLag, loading };
}
