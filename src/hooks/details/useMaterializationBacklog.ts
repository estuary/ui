import type {
    MaterializationBacklog,
    MaterializationTimeLag,
} from 'src/hooks/details/shared';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import {
    getCollectionsLastPublished,
    getMaterializationBacklog,
} from 'src/api/stats';
import {
    computeMaterializationTimeLag,
    latestPublishedByCollection,
    parseMaterializationBacklog,
} from 'src/hooks/details/shared';
import { hasLength } from 'src/utils/misc-utils';

const REFRESH_INTERVAL = 15000;

const SWR_CONFIG = {
    revalidateOnMount: true,
    refreshInterval: REFRESH_INTERVAL,
};

// How far behind a materialization is, in bytes and in time. The bytes come from
// the task's newest hourly stats row that describes its bindings; the time lag
// additionally needs where each source collection has been published up to, so it
// resolves in a second step once the bindings are known.
export function useMaterializationBacklog(catalogName: string) {
    const { data, error, isValidating } = useQuery(
        hasLength(catalogName) ? getMaterializationBacklog(catalogName) : null,
        SWR_CONFIG
    );

    const backlog = useMemo<MaterializationBacklog | null>(
        () => (data ? parseMaterializationBacklog(data) : null),
        [data]
    );

    const collectionNames = useMemo(
        () =>
            backlog?.bindings.map(({ collectionName }) => collectionName) ?? [],
        [backlog]
    );

    const { data: collectionStats, error: collectionStatsError } = useQuery(
        hasLength(collectionNames)
            ? getCollectionsLastPublished(collectionNames)
            : null,
        SWR_CONFIG
    );

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
    const loading = isValidating && !data;

    // The lag needs the follow-up query as well, which cannot start until the
    // bindings are known. A failure there has to end the wait too, or a caller
    // holding a placeholder until this clears would hold it indefinitely.
    const timeLagLoading =
        loading ||
        Boolean(backlog && !collectionStats && !collectionStatsError);

    return {
        backlog,
        loading,
        error,
        isValidating,
        timeLag,
        timeLagLoading,
    };
}
