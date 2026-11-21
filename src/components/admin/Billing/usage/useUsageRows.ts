import type {
    BucketLayout,
    UsagePeriod,
} from 'src/components/admin/Billing/usage/period';
import type { ChargesByMonth } from 'src/hooks/billing/useTaskUsageCharges';
import type { UsageTask } from 'src/hooks/billing/useTaskUsageTasks';

import { useMemo } from 'react';

import { getStatsWindow } from 'src/components/admin/Billing/usage/period';
import { buildUsageRows } from 'src/components/admin/Billing/usage/rows';
import { useTaskUsageStats } from 'src/hooks/billing/useTaskUsageStats';

interface Options {
    tenant: string;
    tasks: UsageTask[];
    period: UsagePeriod;
    layout: BucketLayout;
    // Null when costs aren't shown.
    charges: ChargesByMonth | null;
    // yyyy-MM-dd, before which usage costs nothing.
    billedFrom: string | null;
    pause: boolean;
}

// A row per task over the layout's buckets, or null until the stats load.
export function useUsageRows({
    tenant,
    tasks,
    period,
    layout,
    charges,
    billedFrom,
    pause,
}: Options) {
    // The tenant's own total also holds the usage of deleted tasks.
    const names = useMemo(
        () => [...tasks.map(({ name }) => name), tenant],
        [tasks, tenant]
    );
    const { stats, error } = useTaskUsageStats(
        names,
        getStatsWindow(period, layout.grain),
        pause
    );

    const rows = useMemo(
        () =>
            stats
                ? buildUsageRows(
                      tasks,
                      tenant,
                      stats,
                      layout.buckets,
                      charges,
                      billedFrom
                  )
                : null,
        [billedFrom, charges, layout.buckets, stats, tasks, tenant]
    );

    return { rows, error };
}
