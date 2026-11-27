import type { ReactNode } from 'react';

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { beforeEach, expect, test, vi } from 'vitest';

import { TenantCreate } from 'src/components/onboarding/TenantCreate';
import { UrqlConfigProvider } from 'src/context/URQL';
import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';
import { getGqlUrl } from 'src/utils/env-utils';

vi.mock('@posthog/react', () => ({
    usePostHog: () => ({ capture: vi.fn() }),
}));
vi.mock('src/services/gtm', () => ({ fireGtmEvent: vi.fn() }));

const api = graphql.link(getGqlUrl());
const TAKEN =
    'The organization name is already in use, please choose a different one or contact support@estuary.dev.';
const HINT = /trying to join an organization that already exists/;

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <UrqlConfigProvider>{children}</UrqlConfigProvider>
    </IntlProvider>
);

const pickOption = async (label: RegExp, option: string) => {
    fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
    // A closed menu lingers in the DOM during its exit transition.
    const menus = await screen.findAllByRole('listbox');
    fireEvent.click(await within(menus[menus.length - 1]).findByText(option));
};

const submitWithError = async (message: string) => {
    server.use(
        api.mutation('TenantCreate', () =>
            HttpResponse.json({ errors: [{ message }], data: null })
        )
    );
    render(<TenantCreate />, { wrapper });

    fireEvent.change(screen.getByRole('textbox', { name: /organization/i }), {
        target: { value: 'acmeCo' },
    });
    await waitFor(() =>
        expect(
            screen
                .getByRole('combobox', { name: /data plane/i })
                .getAttribute('aria-disabled')
        ).toBeNull()
    );
    await pickOption(/data plane/i, 'AWS — us-west-2');
    await pickOption(/hear about/i, 'Other');
    fireEvent.click(await screen.findByRole('checkbox'));
    const submit = screen.getByRole('button', { name: 'Continue' });
    await waitFor(() => expect(submit).toHaveProperty('disabled', false));
    fireEvent.click(submit);
};

beforeEach(() => {
    dropFetchSignals();
    server.use(
        api.query('PublicDataPlanes', () =>
            HttpResponse.json({
                data: {
                    publicDataPlanes: {
                        __typename: 'PublicDataPlaneConnection',
                        edges: [
                            {
                                __typename: 'PublicDataPlaneEdge',
                                node: {
                                    __typename: 'PublicDataPlane',
                                    name: 'ops/dp/public/aws-us-west-2-c1',
                                    cloudProvider: 'AWS',
                                    region: 'us-west-2',
                                },
                            },
                        ],
                        pageInfo: {
                            __typename: 'PageInfo',
                            hasNextPage: false,
                            hasPreviousPage: false,
                            startCursor: null,
                            endCursor: null,
                        },
                    },
                },
            })
        ),
        api.query('LegalTerms', () =>
            HttpResponse.json({
                data: {
                    legalTerms: {
                        __typename: 'LegalTerms',
                        id: '0000000000000001',
                        text: 'terms',
                        version: '1',
                    },
                },
            })
        )
    );
});

test('a taken name tells the user how to join the existing organization', async () => {
    await submitWithError(TAKEN);

    expect(await screen.findByText(HINT)).toBeTruthy();
    expect(screen.getByText(/already in use/)).toBeTruthy();
});

test('other creation errors show no invite hint', async () => {
    await submitWithError('invalid tenant name');

    expect(await screen.findByText(/invalid tenant name/)).toBeTruthy();
    expect(screen.queryByText(HINT)).toBeNull();
});
