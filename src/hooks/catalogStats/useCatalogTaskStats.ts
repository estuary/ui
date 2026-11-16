import type { CatalogTaskStats } from 'src/api/catalogStats';
import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    CatalogStatsBy,
    CatalogTaskStatsFieldsFragment,
} from 'src/gql-types/graphql';

import { useMemo, useState } from 'react';

import { chunk } from 'lodash';
import { gql } from 'urql';

import { toCatalogStatsBy, toCatalogTaskStats } from 'src/api/catalogStats';
import { CATALOG_TASK_STATS_FRAGMENT } from 'src/api/gql/catalogStats';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { getCleanCatalogNames } from 'src/utils/names';

// The most names `catalogStats` accepts in one call
const MAX_NAMES_PER_BATCH = 100;

type CatalogTaskStatsOpts = Pick<
    Parameters<typeof usePollingQuery>[0],
    'pause' | 'pollingIntervalMs' | 'requestPolicy'
>;

// Per-binding stats for each interval of the range, which `useCatalogStats`
// leaves out to keep the usage chart's faster poll small. Any number of names
// can be passed.
//
// When only the window moves (a new hour or month, or another range), the
// last result for the same names stands in while the new one loads, flagged
// `stale`. Other names never get it.
export function useCatalogTaskStats(
    catalogNames: string | string[],
    range: DataByHourRange,
    opts: CatalogTaskStatsOpts = {}
) {
    const names = useMemo(
        () => getCleanCatalogNames(catalogNames),
        [catalogNames]
    );

    // At least one batch, so the query stays valid while paused with no names
    const batches = chunk(names, MAX_NAMES_PER_BATCH);
    const batchCount = Math.max(batches.length, 1);

    const query = useMemo(() => buildBatchQuery(batchCount), [batchCount]);
    const pause = opts.pause || names.length <= 0;

    const variables = Object.fromEntries(
        Array.from({ length: batchCount }, (_, index) => [
            `vars_${index}`,
            toCatalogStatsBy(batches[index] ?? [], range),
        ])
    );

    const { data, error, fetching } = usePollingQuery({
        ...opts,
        pause,
        query,
        variables,
    });

    // A failed batch is missing from the data, with the error alongside
    const stats = useMemo<CatalogTaskStats[] | undefined>(
        () =>
            data
                ? Object.values(data).flatMap(
                      (batch) =>
                          batch?.edges.map(({ node }) =>
                              toCatalogTaskStats(node)
                          ) ?? []
                  )
                : undefined,
        [data]
    );

    // make sure the results are cleared if the names change,
    // so the new ones don't get the old results
    const namesKey = names.join('\n');
    const [retained, setRetained] = useState({ namesKey, stats });
    if (stats && (stats !== retained.stats || namesKey !== retained.namesKey)) {
        setRetained({ namesKey, stats });
    }

    const stale =
        !stats &&
        fetching &&
        namesKey === retained.namesKey &&
        Boolean(retained.stats);

    return {
        data: stale ? retained.stats : stats,
        error,
        fetching,
        stale,
    };
}

const buildBatchQuery = (batchCount: number) => {
    const batches = Array.from({ length: batchCount }, (_, index) => index);

    const variables = batches
        .map((index) => `$vars_${index}: CatalogStatsBy!`)
        .join(', ');

    const fields = batches
        .map(
            (index) =>
                `batch_${index}: catalogStats(by: $vars_${index}) { 
                    edges { node { ...CatalogTaskStatsFields } }
                }`
        )
        .join('\n');

    const operation = `
        query CatalogTaskStatsBatch(${variables}) { 
            ${fields} 
        }
    `;

    type CatalogTaskStatsBatch = Record<
        string,
        { edges: { node: CatalogTaskStatsFieldsFragment }[] }
    >;

    return gql<CatalogTaskStatsBatch, Record<string, CatalogStatsBy>>`
        ${operation}
        ${CATALOG_TASK_STATS_FRAGMENT}
    `;
};
