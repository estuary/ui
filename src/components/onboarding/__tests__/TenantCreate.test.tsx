import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import TenantCreate from 'src/components/onboarding/TenantCreate';

import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
    create: vi.fn(),
    refetch: vi.fn(),
    planes: {
        data: [
            {
                name: 'ops/dp/public/aws-us-east-1',
                cloudProvider: 'AWS',
                region: 'us-east-1',
            },
            {
                name: 'ops/dp/public/gcp-europe-west1',
                cloudProvider: 'GCP',
                region: 'europe-west1',
            },
        ],
        loading: false,
        error: undefined as Error | undefined,
    },
}));
vi.mock('src/api/gql/tenant', () => ({
    useTenantCreate: () => [{}, mocks.create],
}));
vi.mock('src/api/gql/publicDataPlanes', () => ({
    usePublicDataPlanes: () => mocks.planes,
}));
vi.mock('urql', () => ({
    useQuery: () => [
        { data: { legalTerms: { id: 'msa-1' } }, fetching: false },
        mocks.refetch,
    ],
}));
vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture: vi.fn() }) }));
vi.mock('src/components/navigation/Logo', () => ({ default: () => null }));
vi.mock('src/components/shared/AlertBox', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div role="alert">{children}</div>
    ),
}));
vi.mock('src/components/shared/ExternalLink', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
}));
vi.mock('src/context/GlobalProviders', () => ({
    supabaseClient: { auth: { signOut: vi.fn() } },
}));
vi.mock('src/services/gtm', () => ({ fireGtmEvent: vi.fn() }));
vi.mock('src/services/shared', () => ({ logRocketEvent: vi.fn() }));
vi.mock('src/utils/env-utils', () => ({
    getUrls: () => ({ privacyPolicy: '/privacy', termsOfService: '/terms' }),
}));

const continueButton = () => screen.getByRole('button', { name: 'Continue' });
async function fillOtherFields() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Organization Name/), 'Acme');
    await user.click(
        screen.getByRole('combobox', { name: /Where did you hear/ })
    );
    await user.click(screen.getByRole('option', { name: 'Other' }));
    await user.click(screen.getByRole('checkbox'));
    return user;
}

describe('tenant creation data plane selection', () => {
    const planes = [...mocks.planes.data];
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.planes = { data: [...planes], loading: false, error: undefined };
    });
    afterEach(cleanup);

    test('requires a selection, sends its full name, and permits retry after a server error', async () => {
        mocks.create
            .mockResolvedValueOnce({ error: { message: 'Please retry' } })
            .mockResolvedValueOnce({ data: { tenantCreate: true } });
        const mutate = vi.fn();
        render(<TenantCreate mutate={mutate} />);
        const user = await fillOtherFields();
        expect(continueButton()).toBeDisabled();
        await user.click(screen.getByRole('combobox', { name: /Data plane/ }));
        await user.click(
            screen.getByRole('option', { name: 'GCP — europe-west1' })
        );
        await waitFor(() => expect(continueButton()).toBeEnabled());
        await user.click(continueButton());
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Please retry'
        );
        await waitFor(() => expect(continueButton()).toBeEnabled());
        await user.click(continueButton());
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce());
        expect(mocks.create).toHaveBeenLastCalledWith({
            name: 'Acme',
            dataPlane: planes[1].name,
            submittingUserAgreesToTermsId: 'msa-1',
            survey: { origin: 'Other', details: '' },
        });
    });

    test.each(['loading', 'error', 'empty'] as const)(
        'blocks submission when the list is %s',
        async (state) => {
            mocks.planes = {
                data: [],
                loading: state === 'loading',
                error: state === 'error' ? new Error('offline') : undefined,
            };
            render(<TenantCreate mutate={null} />);
            await fillOtherFields();
            expect(continueButton()).toBeDisabled();
            expect(
                screen.getByRole('combobox', { name: /Data plane/ })
            ).toHaveAttribute('aria-disabled', 'true');
            if (state === 'error')
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'Unable to load data planes'
                );
            if (state === 'empty')
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'No data planes are currently available'
                );
            expect(mocks.create).not.toHaveBeenCalled();
        }
    );

    test('blocks a previously selected plane that disappears from the list', async () => {
        const { rerender } = render(<TenantCreate mutate={null} />);
        const user = await fillOtherFields();
        await user.click(screen.getByRole('combobox', { name: /Data plane/ }));
        await user.click(
            screen.getByRole('option', { name: 'GCP — europe-west1' })
        );
        await waitFor(() => expect(continueButton()).toBeEnabled());
        mocks.planes = { ...mocks.planes, data: [planes[0]] };
        rerender(<TenantCreate mutate={null} />);
        expect(continueButton()).toBeDisabled();
        expect(
            screen.getByRole('combobox', { name: /Data plane/ })
        ).toHaveTextContent('Select a data plane');
    });
});
