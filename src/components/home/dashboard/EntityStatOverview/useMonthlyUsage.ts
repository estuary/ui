import type { DataByHourRange } from 'src/components/graphs/types';

import { DataGrains } from 'src/components/graphs/types';
import { useCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';
import { useTenantStore } from 'src/stores/Tenant';

const CURRENT_MONTH: DataByHourRange = { grain: DataGrains.monthly, amount: 1 };

export function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { data, error, fetching } = useCatalogStats(
        selectedTenant,
        CURRENT_MONTH
    );

    const [stats] = data[selectedTenant] ?? [];
    const captureUsage = stats ? Number(stats.writtenByMe.bytesTotal) : 0;
    const materializationUsage = stats ? Number(stats.readByMe.bytesTotal) : 0;

    return {
        captureUsage,
        error,
        isLoading: fetching,
        materializationUsage,
    };
}
