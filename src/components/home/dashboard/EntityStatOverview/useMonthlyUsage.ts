import type { DataByHourRange } from 'src/components/graphs/types';

import { DataGrains } from 'src/components/graphs/types';
import { useCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';
import { useTenantStore } from 'src/stores/Tenant';

const CURRENT_MONTH: DataByHourRange = { grain: DataGrains.monthly, amount: 1 };

export function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    // `cache-and-network` shows the cached values first then immediately
    // refetches on every mount. The underlying `usePollingQuery` refetches
    // when the tab is visible again. Both of these are needed to provide
    // the desired stale-while-revalidate behavior.
    const { data, error, fetching } = useCatalogStats(
        selectedTenant,
        CURRENT_MONTH,
        {
            requestPolicy: 'cache-and-network',
            pause: !selectedTenant,
        }
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
