import type { BillingPlan } from 'src/api/gql/billing';
import type { PeriodSelection } from 'src/components/admin/Billing/usage/period';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';

import { Button, Stack } from '@mui/material';

import { Download } from 'iconoir-react';
import { DateTime } from 'luxon';

import { ExportDialog } from 'src/components/admin/Billing/usage/ExportDialog';
import {
    getBucketLayout,
    resolvePeriod,
    selectRange,
} from 'src/components/admin/Billing/usage/period';
import { PeriodControl } from 'src/components/admin/Billing/usage/PeriodControl';
import { filterRows } from 'src/components/admin/Billing/usage/rows';
import { TasksCard } from 'src/components/admin/Billing/usage/TasksCard';
import { UsageChartCard } from 'src/components/admin/Billing/usage/UsageChartCard';
import { useUsageRows } from 'src/components/admin/Billing/usage/useUsageRows';
import { useBillingPlan } from 'src/hooks/billing/useBillingPlan';
import { useTaskUsageCharges } from 'src/hooks/billing/useTaskUsageCharges';
import { useTaskUsageTasks } from 'src/hooks/billing/useTaskUsageTasks';

export interface ListRates {
    dataCents: number;
    hoursCents: number;
}

// The self-serve defaults, for plans without tiers.
const DEFAULT_RATES: ListRates = { dataCents: 50, hoursCents: 14 };

// The chart stacks data and task hours at a rate each, so both share a scale.
// Contracts lead with free tiers for the usage they include, which would
// flatten the bars, so the first priced tier stands in.
const getListRates = (plan: BillingPlan | null | undefined): ListRates => {
    if (!plan || plan.__typename === 'InternalPlan') {
        return DEFAULT_RATES;
    }

    const firstPriced = (tiers: { rateCents: number }[]) =>
        tiers.find(({ rateCents }) => rateCents > 0)?.rateCents;

    return {
        dataCents: firstPriced(plan.dataTiers) ?? DEFAULT_RATES.dataCents,
        hoursCents: firstPriced(plan.usageTiers) ?? DEFAULT_RATES.hoursCents,
    };
};

export function UsageTab({ tenant }: { tenant: string }) {
    // Undefined while it loads.
    const { plan } = useBillingPlan(tenant);
    // Billing months and stats buckets are UTC.
    const [today] = useState(() => DateTime.utc().startOf('day'));
    const [selection, setSelection] = useState<PeriodSelection>({
        preset: 'this',
    });
    const [query, setQuery] = useState('');
    const [exporting, setExporting] = useState(false);

    const period = useMemo(
        () => resolvePeriod(selection, today),
        [selection, today]
    );
    const layout = useMemo(
        () => getBucketLayout(period, today),
        [period, today]
    );

    // The design shows cost to paying self-serve tenants only.
    const showCost =
        plan?.__typename === 'SelfServePlan' && plan.phase === 'PAID';

    const tasks = useTaskUsageTasks(tenant);
    const charges = useTaskUsageCharges(
        tenant,
        period.from,
        period.to,
        !showCost
    );

    const costShown = showCost && !charges.error;
    const chargesReady = costShown ? charges.charges : null;
    const billedFrom = showCost ? (plan.trial?.end ?? null) : null;

    const usage = useUsageRows({
        tenant,
        tasks: tasks.tasks,
        period,
        layout,
        charges: chargesReady,
        billedFrom,
        pause: tasks.loading || Boolean(tasks.error),
    });
    // Rows that show costs wait for them.
    const rows = costShown && charges.loading ? null : usage.rows;

    const deferredQuery = useDeferredValue(query);
    const filtered = useMemo(
        () => (rows ? filterRows(rows, deferredQuery) : null),
        [deferredQuery, rows]
    );

    const error = tasks.error ?? usage.error;

    const selectMonth = useCallback(
        (start: DateTime) =>
            setSelection(
                selectRange(start, start.endOf('month').startOf('day'), today)
            ),
        [today]
    );

    return (
        <Stack spacing={2}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    justifyContent: 'space-between',
                }}
            >
                <PeriodControl
                    onChange={setSelection}
                    period={period}
                    today={today}
                />

                <Button
                    disabled={!rows}
                    onClick={() => setExporting(true)}
                    size="small"
                    startIcon={<Download height={16} width={16} />}
                    variant="outlined"
                >
                    Export
                </Button>
            </Stack>

            <UsageChartCard
                error={error}
                isFiltered={deferredQuery.trim() !== ''}
                layout={layout}
                onSelectMonth={selectMonth}
                period={period}
                rates={getListRates(plan)}
                rows={filtered}
            />

            <TasksCard
                costError={showCost ? charges.error : undefined}
                error={error}
                filtered={filtered}
                layout={layout}
                onQueryChange={setQuery}
                period={period}
                query={query}
                rows={rows}
                showCost={costShown}
                tenant={tenant}
            />

            {exporting && rows ? (
                <ExportDialog
                    billedFrom={billedFrom}
                    charges={chargesReady}
                    layout={layout}
                    onClose={() => setExporting(false)}
                    period={period}
                    rows={rows}
                    tasks={tasks.tasks}
                    tenant={tenant}
                />
            ) : null}
        </Stack>
    );
}
