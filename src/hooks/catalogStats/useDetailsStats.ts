import type { CatalogStats } from 'src/api/gql/catalogStats';
import type { CatalogStats_Details, Entity } from 'src/types';

import { useMemo } from 'react';

import { usePollCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const STATS_POLL_INTERVAL_MS = 15000;

export function useDetailsStats(entityType: Entity, catalogName: string) {
    const names = [catalogName];
    const range = useDetailsUsageStore((state) => state.range);
    const { data, fetching, error, updatedAt } = usePollCatalogStats(
        names,
        range,
        STATS_POLL_INTERVAL_MS
    );

    const stats = useMemo(() => {
        const catalogData = data[catalogName] ?? [];
        return catalogData.map((stats) =>
            convertToDetailStats(entityType, stats)
        );
    }, [catalogName, entityType, data]);

    return { stats, fetching, error, updatedAt };
}

function convertToDetailStats(
    entityType: Entity,
    stats: CatalogStats
): CatalogStats_Details {
    const details: CatalogStats_Details = {
        catalog_name: stats.catalogName,
        grain: stats.grain,
        ts: stats.timestamp,
    };

    // TODO (adrian): GraphQL API returns UInt64s for stats data.
    // Update graph support to use BigInt and remove these Number casts.
    if (entityType === 'capture') {
        details.docs_written = Number(stats.writtenByMe.docsTotal);
        details.bytes_written = Number(stats.writtenByMe.bytesTotal);
    }
    if (entityType === 'materialization') {
        details.docs_read = Number(stats.readByMe.docsTotal);
        details.bytes_read = Number(stats.readByMe.bytesTotal);
    }
    if (entityType === 'collection') {
        details.docs_read = Number(stats.readFromMe.docsTotal);
        details.bytes_read = Number(stats.readFromMe.bytesTotal);
        details.docs_written = Number(stats.writtenToMe.docsTotal);
        details.bytes_written = Number(stats.writtenToMe.bytesTotal);
    }

    return details;
}
