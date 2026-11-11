import type { DataByHourRange } from 'src/components/graphs/types';

import { useMemo } from 'react';

import { DataGrains } from 'src/components/graphs/types';
import { useCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';
import { useTenantStore } from 'src/stores/Tenant';

const CURRENT_MONTH: DataByHourRange = { grain: DataGrains.monthly, amount: 1 };
const POLLING_INTERVAL_MS = 15000;

export function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const opts = useMemo(
        () => ({
            pollingIntervalMs: POLLING_INTERVAL_MS,
            pause: !selectedTenant,
        }),
        [selectedTenant]
    );

    const { data, error, fetching } = useCatalogStats(
        selectedTenant,
        CURRENT_MONTH,
        opts
    );

    const [stats] = data[selectedTenant] ?? [];
    const captureUsage = stats ? Number(stats.writtenByMe.bytesTotal) : 0;
    const materializationUsage = stats ? Number(stats.readByMe.bytesTotal) : 0;
    const isLoading = fetching && !stats;

    return {
        captureUsage,
        error,
        isLoading,
        materializationUsage,
    };
}
