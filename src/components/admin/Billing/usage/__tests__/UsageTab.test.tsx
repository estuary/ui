import type { ReactNode } from 'react';

import {
    configure,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { UsageTab } from 'src/components/admin/Billing/usage/UsageTab';
import { UrqlConfigProvider } from 'src/context/URQL';
import {
    billingGraphql,
    invoice,
    invoicesData,
    noConnectorsData,
    planData,
    usageSpecsData,
    usageStatsData,
} from 'src/test/billing';
import { HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';

// ECharts draws nothing in jsdom.
vi.mock('src/components/admin/Billing/usage/UsageBarChart', () => ({
    UsageBarChart: () => null,
}));

configure({ asyncUtilTimeout: 3000 });

const wrapper = ({ children }: { children: ReactNode }) => (
    <UrqlConfigProvider>{children}</UrqlConfigProvider>
);

// One more than a page of tasks, each reading its number in GB a day. The
// tenant's own total is theirs, so no usage is from deleted tasks.
const names = Array.from(
    { length: 12 },
    (_, index) => `acme/task-${String(index + 1).padStart(2, '0')}`
);
const gbOf = (name: string) => (name === 'acme/' ? 78 : Number(name.slice(-2)));

beforeEach(() => {
    dropFetchSignals();
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-09T12:00Z') });
    server.use(
        billingGraphql.query('TenantBillingPlan', () =>
            HttpResponse.json({ data: planData() })
        ),
        billingGraphql.query('TaskUsageSpecs', () =>
            HttpResponse.json({ data: usageSpecsData(names) })
        ),
        billingGraphql.query('TaskUsageStatsBatch', ({ variables }) =>
            HttpResponse.json({ data: usageStatsData(variables, gbOf) })
        ),
        // November's data is billed at $0.50/GB, so a GB costs $0.50.
        billingGraphql.query('TaskUsageInvoices', () =>
            HttpResponse.json({
                data: invoicesData([
                    invoice('11', {
                        invoiceType: 'PREVIEW',
                        extra: { processed_data_gb: 2960 },
                    }),
                ]),
            })
        ),
        billingGraphql.query('TaskUsageModels', () =>
            HttpResponse.json({
                data: {
                    liveSpecs: {
                        __typename: 'LiveSpecRefConnection',
                        edges: [],
                    },
                },
            })
        ),
        billingGraphql.query('ConnectorsGrid', () =>
            HttpResponse.json({ data: noConnectorsData })
        )
    );
});

afterEach(() => vi.useRealTimers());

const readText = (blob: Blob) =>
    new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(blob);
    });

// One render throughout: a second render of the tab in this file loops in
// jsdom, though the tab remounts cleanly in a browser.
test('pages and filters tasks, picks a custom range and exports it', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:usage');
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
        () => undefined
    );
    render(<UsageTab tenant="acme/" />, { wrapper });

    // A new filter starts again from the first page.
    const tasks = await screen.findByRole('region', { name: 'Tasks' });
    await within(tasks).findByText('1–10 of 12 tasks');
    fireEvent.click(within(tasks).getByRole('button', { name: 'Next page' }));
    await within(tasks).findByText('11–12 of 12 tasks');
    fireEvent.change(within(tasks).getByLabelText('Filter by task'), {
        target: { value: 'task-1' },
    });
    await within(tasks).findByText('1–3 of 3 tasks');
    fireEvent.click(
        within(tasks).getByRole('button', { name: 'Clear search' })
    );
    await within(tasks).findByText('1–10 of 12 tasks');

    // Two clicks on the calendar pick a range: 78 GB a day for 9 days, then 3.
    const chart = screen.getByRole('region', { name: 'Usage chart' });
    await within(chart).findByText('702 GB');
    const period = screen.getByLabelText('Period');
    fireEvent.click(period);
    fireEvent.click(screen.getByRole('button', { name: 'Custom range' }));
    screen.getByText('Pick a start date');
    fireEvent.click(screen.getByRole('gridcell', { name: '3' }));
    screen.getByText(/^Now pick an end date/);
    fireEvent.click(screen.getByRole('gridcell', { name: '5' }));
    await waitFor(() =>
        expect(period.getAttribute('value')).toBe('Custom · Nov 3 – 5, 2026')
    );
    await within(chart).findByText('234 GB');

    // The export has a row per task per day of the range.
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    const dialog = await screen.findByRole('dialog', { name: 'Export usage' });
    within(dialog).getByText(
        '36 rows · acme-usage-2026-11-03-to-2026-11-05.csv'
    );
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Download CSV' })
    );
    const lines = (await readText(createObjectURL.mock.calls[0][0]))
        .replace('\ufeff', '')
        .split('\n');

    expect(lines).toHaveLength(37);
    expect(lines.slice(0, 3)).toEqual([
        'date,task,data_gb,task_hours,cost_usd',
        '2026-11-03,acme/task-01,1.000,24.00,0.50',
        '2026-11-03,acme/task-02,2.000,24.00,1.00',
    ]);
});
