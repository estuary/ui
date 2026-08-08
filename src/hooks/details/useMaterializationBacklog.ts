import type { MaterializationBacklog } from 'src/hooks/details/shared';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getMaterializationBacklog } from 'src/api/stats';
import { parseMaterializationBacklog } from 'src/hooks/details/shared';
import { hasLength } from 'src/utils/misc-utils';

const REFRESH_INTERVAL = 15000;

const SWR_CONFIG = {
    revalidateOnMount: true,
    refreshInterval: REFRESH_INTERVAL,
};

// How far behind a materialization is, taken from its newest hourly stats row
// that describes its bindings.
export function useMaterializationBacklog(catalogName: string) {
    const { data, error, isValidating } = useQuery(
        hasLength(catalogName) ? getMaterializationBacklog(catalogName) : null,
        SWR_CONFIG
    );

    const backlog = useMemo<MaterializationBacklog | null>(
        () => (data ? parseMaterializationBacklog(data) : null),
        [data]
    );

    // True only until the first response lands. A background refresh leaves this
    // false, so a value already on screen is never replaced by a loading state.
    const loading = isValidating && !data;

    return { backlog, loading, error, isValidating };
}
