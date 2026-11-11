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
import { hasLength } from 'src/utils/misc-utils';

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

// How far behind a materialization is, in bytes and in time. The bytes come from
// the task's newest hourly stats row that describes its bindings; the time lag
// additionally needs where each source collection has been published up to, so it
// resolves in a second step once the bindings are known.
export function useMaterializationBacklog(
    catalogName: string,
    boundCollections: string[]
) {
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

    // `catalogStats` rejects the whole request if any name is unreadable, so
    // only ask for source collections the user can read (a read-only user
    // may not reach a collection shared with the task's prefix).
    const readablePrefixes = useEntitiesStore_capabilities_readable();

    const collectionNames = useMemo(
        () =>
            (backlog?.bindings ?? [])
                .map(({ collectionName }) => collectionName)
                .filter((name) =>
                    readablePrefixes.some((prefix) => name.startsWith(prefix))
                ),
        [backlog, readablePrefixes]
    );

    const { data: collectionStats, error: collectionStatsError } =
        useCatalogTaskStats(collectionNames, LAST_PUBLISHED_RANGE, {
            pollingIntervalMs: POLLING_INTERVAL_MS,
        });

    const timeLag = useMemo<MaterializationTimeLag | null>(() => {
        if (!backlog || !collectionStats) {
            return null;
        }

        return computeMaterializationTimeLag(
            backlog.bindings,
            latestPublishedByCollection(collectionStats)
        );
    }, [backlog, collectionStats]);

    // True only until the first response lands. A background refresh leaves these
    // false, so a value already on screen is never replaced by a loading state.
    const loading = fetching && !data;

    // The lag needs the follow-up query as well, which cannot start until the
    // bindings are known. A failure there has to end the wait too, or a caller
    // holding a placeholder until this clears would hold it indefinitely. With
    // no readable source collections the query never runs, so there's no wait.
    const timeLagLoading =
        loading ||
        Boolean(
            hasLength(collectionNames) &&
                !collectionStats &&
                !collectionStatsError
        );

    return {
        backlog,
        loading,
        error,
        isValidating: fetching,
        timeLag,
        timeLagLoading,
    };
}
