import type {
    BucketLayout,
    UsagePeriod,
} from 'src/components/admin/Billing/usage/period';
import type {
    SortKey,
    TaskUsageRow,
} from 'src/components/admin/Billing/usage/rows';
import type { CombinedError } from 'urql';

import { useMemo, useState } from 'react';

import { Stack, useTheme } from '@mui/material';

import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import { CardHeader } from 'src/components/admin/Billing/shared/CardHeader';
import { PagerFooter } from 'src/components/admin/Billing/shared/PagerFooter';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import { formatRange, isoDay } from 'src/components/admin/Billing/usage/period';
import {
    DELETED_TASKS,
    sortRows,
} from 'src/components/admin/Billing/usage/rows';
import { ShareBars } from 'src/components/admin/Billing/usage/ShareBars';
import { TasksTable } from 'src/components/admin/Billing/usage/TasksTable';
import AlertBox from 'src/components/shared/AlertBox';
import { SearchField } from 'src/components/shared/SearchField';
import { logoColors } from 'src/context/Theme';
import { useTaskUsageConnectors } from 'src/hooks/billing/useTaskUsageConnectors';

const PAGE_SIZE = 10;

// With the data, task hours and logo colors, the five that the largest tasks
// on a page take: one cool family, so no task reads as a status. The palette
// has no violet, or light blue for both modes.
const MORE_TASK_COLORS = {
    dark: ['#A78BFA', '#C7D2FE'],
    light: ['#8B5CF6', '#96B0F9'],
};

const countText = (count: number) =>
    `${count.toLocaleString('en-US')} ${count === 1 ? 'task' : 'tasks'}`;

interface Props {
    costError: CombinedError | undefined;
    error: CombinedError | undefined;
    // The rows matching the filter, or null while they load.
    filtered: TaskUsageRow[] | null;
    layout: BucketLayout;
    onQueryChange: (query: string) => void;
    period: UsagePeriod;
    query: string;
    rows: TaskUsageRow[] | null;
    showCost: boolean;
    tenant: string;
}

export function TasksCard({
    costError,
    error,
    filtered,
    layout,
    onQueryChange,
    period,
    query,
    rows,
    showCost,
    tenant,
}: Props) {
    const theme = useTheme();
    const usageColors = useUsageColors();

    const [sort, setSort] = useState<SortKey>('gb');
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    // A new filter, order or period starts again from the first page.
    const pageKey = [
        query,
        sort,
        isoDay(period.from),
        isoDay(period.to),
    ].join();
    const [paging, setPaging] = useState({ key: pageKey, page: 0 });
    // Stored, so that clearing a filter doesn't return to its old page.
    if (paging.key !== pageKey) {
        setPaging({ key: pageKey, page: 0 });
    }

    const sorted = useMemo(
        () => (filtered ? sortRows(filtered, sort) : []),
        [filtered, sort]
    );
    const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page =
        paging.key === pageKey ? Math.min(paging.page, pageCount - 1) : 0;
    const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const taskColors = [
        usageColors.data,
        usageColors.hours,
        ...MORE_TASK_COLORS[theme.palette.mode],
        logoColors.purple,
    ];
    const colorOf = new Map(
        pageRows
            .slice(0, taskColors.length)
            .map(({ name }, index) => [name, taskColors[index]])
    );

    const connectors = useTaskUsageConnectors(
        pageRows
            .map(({ name }) => name)
            .filter((name) => name !== DELETED_TASKS)
    );

    const shortName = (name: string) =>
        name.startsWith(tenant) ? name.slice(tenant.length) : name;

    const toggle = (name: string) =>
        setSelected((current) => (current === name ? null : name));

    const isFiltered = query.trim() !== '';
    const rangeText = formatRange(period.from, period.to);

    let caption: string | undefined;
    if (rows && filtered) {
        caption = isFiltered
            ? `${filtered.length.toLocaleString('en-US')} of ${countText(rows.length)}`
            : countText(rows.length);
    }

    const turnPage = (step: number) =>
        setPaging({ key: pageKey, page: page + step });

    return (
        <BillingCard label="Tasks">
            <Stack spacing={1.5} sx={{ px: 3, pt: 2, pb: 1 }}>
                <CardHeader title="Tasks" caption={caption} />

                {error ? (
                    <AlertBox short severity="error">
                        There was an error loading usage by task. Please try
                        again later.
                    </AlertBox>
                ) : (
                    <>
                        <SearchField
                            fullWidth
                            label="Filter by task"
                            onChange={(event) =>
                                onQueryChange(event.target.value)
                            }
                            onClear={
                                query ? () => onQueryChange('') : undefined
                            }
                            value={query}
                        />

                        {costError ? (
                            <AlertBox short severity="error">
                                There was an error loading costs, so they are
                                left out.
                            </AlertBox>
                        ) : null}

                        {rows ? (
                            <ShareBars
                                colorOf={colorOf}
                                highlighted={hovered ?? selected}
                                onClear={() => {
                                    setSelected(null);
                                    setHovered(null);
                                }}
                                onHover={setHovered}
                                onSelect={toggle}
                                rows={rows}
                                selected={selected}
                                shortName={shortName}
                                showCost={showCost}
                            />
                        ) : null}
                    </>
                )}
            </Stack>

            {error ? null : (
                <>
                    <TasksTable
                        colorOf={colorOf}
                        connectors={connectors}
                        emptyText={
                            isFiltered
                                ? `No tasks match "${query.trim()}".`
                                : 'No task usage in this period.'
                        }
                        layout={layout}
                        onHover={setHovered}
                        onSelect={toggle}
                        onSortChange={setSort}
                        rangeText={rangeText}
                        rows={filtered ? pageRows : null}
                        selected={selected}
                        shortName={shortName}
                        showCost={showCost}
                        sort={sort}
                    />

                    <PagerFooter
                        range={
                            sorted.length > 0
                                ? `${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + pageRows.length} of ${countText(sorted.length)}`
                                : null
                        }
                        label="Task pages"
                        pages={
                            pageCount > 1
                                ? {
                                      previous: {
                                          label: 'Previous page',
                                          disabled: page === 0,
                                          onClick: () => turnPage(-1),
                                      },
                                      next: {
                                          label: 'Next page',
                                          disabled: page === pageCount - 1,
                                          onClick: () => turnPage(1),
                                      },
                                  }
                                : undefined
                        }
                    />
                </>
            )}
        </BillingCard>
    );
}
