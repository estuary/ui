import type { CatalogStatsDetails } from 'src/api/catalogStats';
import type { DataGrains } from 'src/components/graphs/types';
import type { CatalogStats_Details, Entity } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { find } from 'lodash';
import { DateTime, Interval } from 'luxon';

import { getStatsForDetails } from 'src/api/stats';
import {
    defaultQueryDateFormat,
    LUXON_GRAIN_SETTINGS,
} from 'src/services/luxon';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';
import { hasLength } from 'src/utils/misc-utils';

const STATS_POLL_INTERVAL_MS = 15000;

/**
 * The PostgREST-backed usage stats, kept alongside the GraphQL implementation
 * while the migration is behind the `?gqlStats` flag (see `useGqlStatsEnabled`,
 * switched on in `Usage`). It returns the same shape as `useDetailsStatsGql`
 * so the chart renders both sources through one row type.
 */
// TODO (adrian): Replace this with useDetailsStatsGql once gql stats is verified in production.
export function useDetailsStats(entityType: Entity, catalogName: string) {
    const range = useDetailsUsageStore((state) => state.range);
    const { relativeUnit, timeUnit } = LUXON_GRAIN_SETTINGS[range.grain];

    const { data, error, isValidating } = useQuery(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, range)
            : null,
        {
            revalidateOnMount: true,
            refreshInterval: STATS_POLL_INTERVAL_MS,
        }
    );

    const stats = useMemo<CatalogStatsDetails[]>(() => {
        if (!data || data.length === 0) {
            return [];
        }

        // Server is in UTC so start with that.
        const max = DateTime.utc().startOf(timeUnit);

        // Subtracting 1 because the interval is inclusive of the minimum.
        const min = max.minus({ [relativeUnit]: range.amount - 1 });

        // Walk the whole interval so a bucket the server has no row for still
        // renders as an explicit zero rather than a gap.
        return Interval.fromDateTimes(min, max.plus({ [relativeUnit]: 1 }))
            .splitBy({ [relativeUnit]: 1 })
            .map((timeInterval) => {
                const ts =
                    timeInterval.start?.toFormat(defaultQueryDateFormat) ?? '';

                return toCatalogStatsDetails(
                    ts,
                    range.grain,
                    find(data, { ts })
                );
            });
    }, [data, range.amount, range.grain, relativeUnit, timeUnit]);

    // Mirrors `usePollingQuery`: stamped when a fetch settles without an
    // error, so "Last Updated" means the same thing on both code paths.
    const [updatedAt, setUpdatedAt] = useState<DateTime | null>(null);
    const wasValidating = useRef(false);

    useEffect(() => {
        if (wasValidating.current && !isValidating && !error) {
            setUpdatedAt(DateTime.now());
        }
        wasValidating.current = isValidating;
    }, [error, isValidating]);

    return { data: stats, fetching: isValidating, error, updatedAt };
}

function toCatalogStatsDetails(
    ts: string,
    grain: DataGrains,
    row: CatalogStats_Details | undefined
): CatalogStatsDetails {
    return {
        catalogName: row?.catalog_name ?? '',
        grain,
        timestamp: DateTime.fromFormat(ts, defaultQueryDateFormat, {
            zone: 'utc',
        }).toUnixInteger(),
        bytesRead: row?.bytes_read ?? 0,
        docsRead: row?.docs_read ?? 0,
        bytesWritten: row?.bytes_written ?? 0,
        docsWritten: row?.docs_written ?? 0,
    };
}
