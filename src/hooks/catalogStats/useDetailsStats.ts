import type { CatalogStats, CatalogStatsDetails } from 'src/api/catalogStats';
import type { Entity } from 'src/types';

import { useMemo } from 'react';

import { useCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const STATS_POLL_INTERVAL_MS = 15000;

export function useDetailsStats(entityType: Entity, catalogName: string) {
    const names = [catalogName];
    const range = useDetailsUsageStore((state) => state.range);

    const { data, fetching, error, updatedAt } = useCatalogStats(names, range, {
        pollingIntervalMs: STATS_POLL_INTERVAL_MS,
    });

    const stats = useMemo(() => {
        const catalogData = data[catalogName] ?? [];
        return catalogData.map((stats) =>
            convertToDetailStats(entityType, stats)
        );
    }, [catalogName, entityType, data]);

    return { data: stats, fetching, error, updatedAt };
}

function convertToDetailStats(
    entityType: Entity,
    stats: CatalogStats
): CatalogStatsDetails {
    const details: CatalogStatsDetails = {
        catalogName: stats.catalogName,
        grain: stats.grain,
        timestamp: stats.timestamp,
    };

    // TODO (adrian): GraphQL API returns UInt64s for stats data.
    // Update graph support to use BigInt and remove these Number casts.
    if (entityType === 'capture') {
        details.docsWritten = Number(stats.writtenByMe.docsTotal);
        details.bytesWritten = Number(stats.writtenByMe.bytesTotal);
    }
    if (entityType === 'materialization') {
        details.docsRead = Number(stats.readByMe.docsTotal);
        details.bytesRead = Number(stats.readByMe.bytesTotal);
    }
    if (entityType === 'collection') {
        details.docsRead = Number(stats.readFromMe.docsTotal);
        details.bytesRead = Number(stats.readFromMe.bytesTotal);
        details.docsWritten = Number(stats.writtenToMe.docsTotal);
        details.bytesWritten = Number(stats.writtenToMe.bytesTotal);
    }

    return details;
}
