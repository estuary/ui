import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LegalConsent } from 'src/pages/LegalConsent';

import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
    search: 'type=SANDBOX_CONSENT&tenant=acmeCo',
    query: vi.fn(),
    accept: vi.fn(),
    refetch: vi.fn(),
    updateTitle: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
    useSearchParams: () => [new URLSearchParams(mocks.search)],
}));
vi.mock('urql', () => ({
    useQuery: () => [mocks.query(), mocks.refetch],
    useMutation: () => [{}, mocks.accept],
}));
vi.mock('src/context/UpdateHelmet', () => ({
    useUpdateHelmet: () => ({ updateTitle: mocks.updateTitle }),
}));

const terms = {
    id: 'terms-123',
    text: '# Sandbox terms\n\nPlease review this agreement.',
};
function page() {
    return (
        <IntlProvider locale="en">
            <LegalConsent />
        </IntlProvider>
    );
}

describe('LegalConsent', () => {
    beforeEach(() => {
        mocks.search = 'type=SANDBOX_CONSENT&tenant=acmeCo';
        mocks.query.mockReturnValue({
            data: { legalTerms: terms },
            fetching: false,
        });
        mocks.accept.mockResolvedValue({ data: { legalTermsAccept: terms } });
    });

    test.each([
        '',
        'type=UNKNOWN&tenant=acmeCo',
        'type=MSA',
        'type=MSA&tenant=acmeCo/data/',
        'type=MSA&type=SANDBOX_CONSENT&tenant=acmeCo',
    ])('rejects invalid links: %s', (search) => {
        mocks.search = search;
        render(page());
        expect(screen.getByText(/Ask for a new link/)).toBeInTheDocument();
        expect(mocks.query).not.toHaveBeenCalled();
    });

    test('shows the terms and accepts the displayed ID for the named tenant', async () => {
        render(page());
        expect(
            screen.getByRole('heading', { name: 'Sandbox terms' })
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        expect(
            await screen.findByText(/have been accepted for acmeCo\//)
        ).toBeInTheDocument();
        expect(mocks.accept).toHaveBeenCalledExactlyOnceWith({
            tenant: 'acmeCo/',
            termsId: terms.id,
        });
    });

    test('declines without recording acceptance', () => {
        render(page());
        fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
        expect(screen.getByText(/No consent was recorded/)).toBeInTheDocument();
        expect(mocks.accept).not.toHaveBeenCalled();
    });

    test.each([
        { fetching: true },
        { fetching: false, error: new Error('Query failed') },
        { fetching: false, data: { legalTerms: null } },
    ])('prevents acceptance until terms load successfully', (result) => {
        mocks.query.mockReturnValue(result);
        render(page());
        expect(screen.getByRole('button', { name: 'Accept' })).toBeDisabled();
        expect(mocks.accept).not.toHaveBeenCalled();
    });

    test('shows mutation errors and allows reloading the latest terms', async () => {
        mocks.accept.mockResolvedValue({
            error: new Error('Terms are outdated'),
        });
        render(page());
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        expect(
            await screen.findByText('Terms are outdated')
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Reload terms' }));
        expect(mocks.refetch).toHaveBeenCalledWith({
            requestPolicy: 'network-only',
        });
    });

    test('locks both actions while submitting and resets decisions when the tenant changes', async () => {
        let resolve!: (value: unknown) => void;
        mocks.accept.mockReturnValue(
            new Promise((done) => {
                resolve = done;
            })
        );
        const view = render(page());
        fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
        expect(
            screen.getByRole('button', { name: 'Accepting…' })
        ).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Decline' })).toBeDisabled();
        mocks.search = 'type=MSA&tenant=otherCo';
        view.rerender(page());
        await act(async () => {
            resolve({ data: { legalTermsAccept: terms } });
        });
        expect(screen.getByRole('button', { name: 'Accept' })).toBeEnabled();
        expect(
            screen.queryByText(/have been accepted/)
        ).not.toBeInTheDocument();
    });
});
