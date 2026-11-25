import type { ReactNode } from 'react';

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';

import { SpendAlertCard } from 'src/components/admin/Billing/overview/SpendAlert/SpendAlertCard';
import { UrqlConfigProvider } from 'src/context/URQL';
import { useSpendAlert } from 'src/hooks/billing/useSpendAlert';
import { handleSpendAlert } from 'src/test/billingAlert';
import { dropFetchSignals } from 'src/test/shared';

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <MemoryRouter>
            <UrqlConfigProvider>{children}</UrqlConfigProvider>
        </MemoryRouter>
    </IntlProvider>
);

const amountSet = {
    billingThresholdExceeded: {
        enabled: true,
        condition: { usdCents: 250000 },
    },
};

// The overview reads the spend alert and hands it to the card.
function Card({ canEdit = true }: { canEdit?: boolean }) {
    const spendAlert = useSpendAlert('acme/', { checkRecipients: canEdit });

    return (
        <SpendAlertCard
            tenant="acme/"
            canEdit={canEdit}
            spendAlert={spendAlert}
            chargesCents={68240}
        />
    );
}

beforeEach(() => dropFetchSignals());

test('saving merges the amount into the row and refreshes the card', async () => {
    const shardFailed = { condition: { failures: 5 } };
    const { reads, writes } = handleSpendAlert({ config: { shardFailed } });
    render(<Card />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: 'Set Up' }));
    const dialog = await screen.findByRole('dialog');
    const amount = within(dialog).getByLabelText('Amount ($)');

    fireEvent.change(amount, { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await within(dialog).findByText('Enter an amount above $0.');

    fireEvent.change(amount, { target: { value: '$2,500' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await screen.findByText("Email when this month's charges reach $2,500.");
    expect(writes).toEqual([
        {
            catalogPrefixOrName: 'acme/',
            config: {
                shardFailed,
                billingThresholdExceeded: {
                    enabled: true,
                    condition: { usdCents: 250000 },
                },
            },
        },
    ]);
    // The card's read, the read before writing, and the refresh after it.
    expect(reads.config).toBe(3);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('disabling keeps the amount and turns the alert off', async () => {
    const { writes } = handleSpendAlert({ config: amountSet });
    render(<Card />, { wrapper });

    await screen.findByText('$682 of $2,500');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(
        within(await screen.findByRole('dialog')).getByRole('button', {
            name: 'Disable',
        })
    );

    await screen.findByRole('button', { name: 'Set Up' });
    expect(writes).toEqual([
        {
            catalogPrefixOrName: 'acme/',
            config: {
                billingThresholdExceeded: {
                    enabled: false,
                    condition: { usdCents: 250000 },
                },
            },
        },
    ]);
});

test('editors are sent to Settings when no subscription gets the alert', async () => {
    handleSpendAlert({ config: amountSet, alertTypes: ['shard_failed'] });
    render(<Card />, { wrapper });

    const link = await screen.findByRole('link', { name: 'Settings' });
    expect(link.getAttribute('href')).toBe('/admin/settings?prefix=acme%2F');
});

test('view-only users get no edit action and no recipients check', async () => {
    const { reads } = handleSpendAlert({ config: amountSet, alertTypes: [] });
    render(<Card canEdit={false} />, { wrapper });

    await screen.findByText('Admins only');
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(reads.subscriptions).toBe(0);
});
