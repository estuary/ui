import type { ReactNode } from 'react';
import type {
    AddDataPlanePrivateLinkMutationVariables,
    CapabilityBundle,
    DataPlanePrivateLinksQuery,
    UpdateDataPlanePrivateLinkMutationVariables,
} from 'src/gql-types/graphql';
import type { PrivateLink } from 'src/utils/private-link-utils';

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PrivateLinks } from 'src/components/admin/Settings/PrivateLinks';
import { UrqlConfigProvider } from 'src/context/URQL';
import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';
import { getGqlUrl } from 'src/utils/env-utils';

vi.mock('src/stores/Tenant', () => ({
    useTenantStore: (
        selector: (state: { selectedTenant: string }) => unknown
    ) => selector({ selectedTenant: 'acmeCo/' }),
}));

type DataPlane = DataPlanePrivateLinksQuery['dataPlanes']['edges'][0]['node'];

const api = graphql.link(getGqlUrl());

const AWS_PLANE = 'ops/dp/private/acmeCo/aws-us-east-2-c1';
const SERVICE = 'com.amazonaws.vpce.us-east-2.vpce-svc-0a1b2c3d4e5f67890';
const DNS_NAME =
    'vpce-0b7c6d5e-k3x9q2wm.vpce-svc-0a1b2c3d4e5f67890.us-east-2.vpce.amazonaws.com';

const awsLink = (
    id: string,
    serviceName: string,
    fields: Partial<PrivateLink> = {}
): PrivateLink => ({
    __typename: 'PrivateLink',
    id,
    status: 'PENDING',
    error: null,
    details: null,
    observedAt: null,
    config: {
        __typename: 'AWSPrivateLink',
        serviceName,
        region: 'us-east-2',
        serviceRegion: null,
        azIds: ['use2-az1', 'use2-az2'],
    },
    ...fields,
});

const provisioned = awsLink('01', SERVICE, {
    status: 'PROVISIONED',
    details: { service_name: SERVICE, dns_entries: [{ dns_name: DNS_NAME }] },
    observedAt: '2026-11-12T10:00:00Z',
});
const failed = awsLink(
    '02',
    'com.amazonaws.vpce.us-east-2.vpce-svc-04d2c1b0a9f8e7d65',
    {
        status: 'FAILED',
        error: "Invalid PrivateLink Availability Zone ID 'use2-az9'",
        observedAt: '2026-11-12T10:00:00Z',
    }
);

const awsPlane = (privateLinks: PrivateLink[]): DataPlane => ({
    __typename: 'DataPlane',
    name: AWS_PLANE,
    cloudProvider: 'AWS',
    region: 'us-east-2',
    privateLinks,
});

// What the API reports on the data planes prefix for a tenant admin whose
// grant there carries the bundle to manage them, and for one whose grant
// doesn't.
const VIEW_ONLY: CapabilityBundle[] = [
    'Viewer',
    'ViewDataPlanePrivateNetworking',
];
const MANAGE: CapabilityBundle[] = [
    ...VIEW_ONLY,
    'ManageDataPlane',
    'ModifyDataPlanePrivateNetworking',
];

// What the server holds, and the changes it was asked to make.
let planes: DataPlane[];
let grantPrefix: string;
let bundles: CapabilityBundle[];
let added: AddDataPlanePrivateLinkMutationVariables[];
let updated: UpdateDataPlanePrivateLinkMutationVariables[];
let removed: string[];

const linksData = (): DataPlanePrivateLinksQuery => ({
    dataPlanes: {
        __typename: 'DataPlaneConnection',
        edges: planes.map((node) => ({ __typename: 'DataPlaneEdge', node })),
    },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <UrqlConfigProvider>{children}</UrqlConfigProvider>
    </IntlProvider>
);

const renderLinks = async () => {
    render(<PrivateLinks />, { wrapper });
    await waitFor(() =>
        expect(screen.queryByRole('progressbar', { hidden: false })).toBeNull()
    );
};

const openLink = async (serviceId: string) => {
    fireEvent.click(await screen.findByRole('button', { name: serviceId }));
    return screen.findByRole('dialog');
};

const field = (dialog: HTMLElement, label: string) =>
    within(dialog).getByLabelText(label) as HTMLInputElement;

afterEach(() => {
    vi.useRealTimers();
});

beforeEach(() => {
    dropFetchSignals();
    planes = [awsPlane([provisioned, failed])];
    grantPrefix = 'ops/dp/private/acmeCo/';
    bundles = MANAGE;
    added = [];
    updated = [];
    removed = [];

    server.use(
        api.query('DataPlanePrivateLinks', () =>
            HttpResponse.json({ data: linksData() })
        ),
        // Each field returns the grant only if its filter matches the prefix
        // the grant is on.
        api.query('PrivateLinkCapabilities', ({ variables }) => {
            const connection = (matches: boolean) => ({
                __typename: 'PrefixRefConnection',
                edges: matches
                    ? [
                          {
                              __typename: 'PrefixRefEdge',
                              node: {
                                  __typename: 'PrefixRef',
                                  prefix: grantPrefix,
                                  capabilities: bundles,
                              },
                          },
                      ]
                    : [],
            });

            return HttpResponse.json({
                data: {
                    above: connection(variables.above.includes(grantPrefix)),
                    within: connection(
                        grantPrefix.startsWith(variables.within)
                    ),
                },
            });
        }),
        api.mutation('AddDataPlanePrivateLink', ({ variables }) => {
            added.push(variables as AddDataPlanePrivateLinkMutationVariables);
            const link = awsLink('03', variables.config.aws.serviceName);
            planes = [awsPlane([...planes[0].privateLinks, link])];
            return HttpResponse.json({
                data: { addDataPlanePrivateLink: link },
            });
        }),
        api.mutation('UpdateDataPlanePrivateLink', ({ variables }) => {
            updated.push(
                variables as UpdateDataPlanePrivateLinkMutationVariables
            );
            const link = awsLink(
                variables.id,
                variables.config.aws.serviceName,
                {
                    config: {
                        __typename: 'AWSPrivateLink',
                        ...variables.config.aws,
                    },
                }
            );
            return HttpResponse.json({
                data: { updateDataPlanePrivateLink: link },
            });
        }),
        api.mutation('RemoveDataPlanePrivateLink', ({ variables }) => {
            removed.push(variables.id);
            planes = [
                awsPlane(
                    planes[0].privateLinks.filter(
                        ({ id }) => id !== variables.id
                    )
                ),
            ];
            return HttpResponse.json({
                data: { removeDataPlanePrivateLink: variables.id },
            });
        })
    );
});

test('lists each link with its status and address, or why it failed', async () => {
    await renderLinks();

    const [, provisionedRow, failedRow] = await screen.findAllByRole('row');

    expect(within(provisionedRow).getByText('Provisioned')).toBeTruthy();
    expect(within(provisionedRow).getByText(DNS_NAME)).toBeTruthy();
    expect(within(provisionedRow).getByText('AWS: us-east-2 c1')).toBeTruthy();

    expect(within(failedRow).getByText('Failed')).toBeTruthy();
    expect(
        within(failedRow).getByText(
            "Invalid PrivateLink Availability Zone ID 'use2-az9'"
        )
    ).toBeTruthy();
});

test('follows a pending link until it settles, keeping the list through a failed poll', async () => {
    // Only the poll's interval is faked, so requests still resolve in real time.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const poll = () => act(() => vi.advanceTimersByTime(15000));

    planes = [awsPlane([awsLink('01', SERVICE)])];
    await renderLinks();
    const dialog = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    expect(within(dialog).getByText('Setting up this link')).toBeTruthy();

    server.use(
        api.query('DataPlanePrivateLinks', () =>
            HttpResponse.json({ errors: [{ message: 'unavailable' }] })
        )
    );
    poll();
    expect(await screen.findByText(/couldn't be refreshed/)).toBeTruthy();
    expect(within(dialog).getByText('Setting up this link')).toBeTruthy();

    planes = [awsPlane([provisioned])];
    server.use(
        api.query('DataPlanePrivateLinks', () =>
            HttpResponse.json({ data: linksData() })
        )
    );
    poll();
    expect(await within(dialog).findByText(DNS_NAME)).toBeTruthy();
    expect(screen.queryByText(/couldn't be refreshed/)).toBeNull();
});

test('says where links are set up when the tenant has no private data plane', async () => {
    planes = [];
    await renderLinks();

    expect(
        await screen.findByText(/private and BYOC data planes/)
    ).toBeTruthy();
    expect(
        screen.queryByRole('button', { name: 'Add private link' })
    ).toBeNull();
});

test('without the bundle to modify, links can be viewed but not changed', async () => {
    bundles = VIEW_ONLY;
    await renderLinks();

    const dialog = await openLink('vpce-svc-0a1b2c3d4e5f67890');

    expect(within(dialog).getByText(DNS_NAME)).toBeTruthy();
    expect(within(dialog).getByText('vpce-0b7c6d5e')).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(within(dialog).queryByRole('button', { name: 'Remove' })).toBeNull();
    expect(
        screen.queryByRole('button', { name: 'Add private link' })
    ).toBeNull();
});

test('without the bundle to view, says the links are hidden rather than absent', async () => {
    // The API returns no links to a user who may not view them.
    planes = [awsPlane([])];
    bundles = ['Viewer'];
    await renderLinks();

    expect(
        await screen.findByText(
            /don't have permission to view the private links on AWS: us-east-2 c1/
        )
    ).toBeTruthy();
    expect(screen.queryByText(/No private links yet/)).toBeNull();
    expect(
        screen.queryByRole('button', { name: 'Add private link' })
    ).toBeNull();
});

test.each(['ops/dp/', 'ops/dp/private/acmeCo/team/'])(
    'counts the bundles of a grant on %s',
    async (prefix) => {
        grantPrefix = prefix;
        planes = [
            {
                ...awsPlane([provisioned]),
                name: 'ops/dp/private/acmeCo/team/aws-us-east-2-c1',
            },
        ];
        await renderLinks();

        expect(
            await screen.findByRole('button', { name: 'Add private link' })
        ).toBeTruthy();
        expect(screen.queryByText(/don't have permission/)).toBeNull();
    }
);

test('adds a link once its fields are valid, then shows it pending', async () => {
    await renderLinks();

    fireEvent.click(
        await screen.findByRole('button', { name: 'Add private link' })
    );
    const dialog = await screen.findByRole('dialog');
    const submit = () =>
        fireEvent.click(
            within(dialog).getByRole('button', { name: 'Add private link' })
        );

    submit();
    expect(
        within(dialog).getByText('Enter the endpoint service name.')
    ).toBeTruthy();

    // The same service again, in zones named rather than identified.
    fireEvent.change(field(dialog, 'Endpoint service name'), {
        target: { value: SERVICE },
    });
    fireEvent.change(field(dialog, 'Availability Zone IDs'), {
        target: { value: 'us-east-2a' },
    });
    submit();
    expect(within(dialog).getByText(/already has a private link/)).toBeTruthy();
    expect(within(dialog).getByText(/us-east-2a is a zone name/)).toBeTruthy();
    expect(added).toEqual([]);

    const serviceName =
        'com.amazonaws.vpce.eu-west-1.vpce-svc-0f9e8d7c6b5a43210';
    fireEvent.change(field(dialog, 'Endpoint service name'), {
        target: { value: serviceName },
    });
    fireEvent.change(field(dialog, 'Availability Zone IDs'), {
        target: { value: '[use2-az1, use2-az3]' },
    });
    expect(within(dialog).getByText('Cross-region link')).toBeTruthy();
    submit();

    const details = await screen.findByRole('dialog', {
        name: /vpce-svc-0f9e8d7c6b5a43210/,
    });
    expect(within(details).getByText('Setting up this link')).toBeTruthy();
    expect(added).toEqual([
        {
            dataPlaneName: AWS_PLANE,
            config: {
                aws: {
                    serviceName,
                    region: 'us-east-2',
                    serviceRegion: 'eu-west-1',
                    azIds: ['use2-az1', 'use2-az3'],
                },
            },
        },
    ]);
});

test('editing keeps the service, and saves only a changed config', async () => {
    await renderLinks();

    const details = await openLink('vpce-svc-04d2c1b0a9f8e7d65');
    expect(
        within(details).getByText("This link couldn't be set up")
    ).toBeTruthy();

    fireEvent.click(within(details).getByRole('button', { name: 'Edit' }));
    let dialog = await screen.findByRole('dialog');
    expect(field(dialog, 'Endpoint service name').disabled).toBe(true);

    // Unchanged, so there is nothing to save.
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Save changes' })
    );
    await screen.findByText("This link couldn't be set up");
    expect(updated).toEqual([]);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    dialog = await screen.findByRole('dialog');
    fireEvent.change(field(dialog, 'Availability Zone IDs'), {
        target: { value: 'use2-az1, use2-az3' },
    });
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Save changes' })
    );

    await screen.findByText('Setting up this link');
    expect(updated).toEqual([
        {
            id: '02',
            config: {
                aws: {
                    serviceName:
                        'com.amazonaws.vpce.us-east-2.vpce-svc-04d2c1b0a9f8e7d65',
                    region: 'us-east-2',
                    serviceRegion: null,
                    azIds: ['use2-az1', 'use2-az3'],
                },
            },
        },
    ]);
});

test('removes a link after confirmation', async () => {
    await renderLinks();

    const details = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    fireEvent.click(within(details).getByRole('button', { name: 'Remove' }));

    const confirm = await screen.findByRole('dialog');
    expect(
        within(confirm).getByText(/Captures and materializations/)
    ).toBeTruthy();
    fireEvent.click(
        within(confirm).getByRole('button', { name: 'Remove private link' })
    );

    await waitFor(() =>
        expect(
            screen.queryByRole('button', { name: 'vpce-svc-0a1b2c3d4e5f67890' })
        ).toBeNull()
    );
    expect(removed).toEqual(['01']);
    expect(screen.queryByRole('dialog')).toBeNull();
});

test('keeps the form open with the server error when a save fails', async () => {
    server.use(
        api.mutation('AddDataPlanePrivateLink', () =>
            HttpResponse.json({
                data: null,
                errors: [{ message: 'data plane not found' }],
            })
        )
    );
    await renderLinks();

    fireEvent.click(
        await screen.findByRole('button', { name: 'Add private link' })
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(field(dialog, 'Endpoint service name'), {
        target: {
            value: 'com.amazonaws.vpce.us-east-2.vpce-svc-0f9e8d7c6b5a43210',
        },
    });
    fireEvent.change(field(dialog, 'Availability Zone IDs'), {
        target: { value: 'use2-az1' },
    });
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Add private link' })
    );

    expect(
        await within(dialog).findByText('data plane not found')
    ).toBeTruthy();
    expect(field(dialog, 'Availability Zone IDs').value).toBe('use2-az1');
});
