import type { ReactNode } from 'react';
import type {
    CapabilityBundle,
    DataPlanePrivateLinksQuery,
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
import { beforeEach, expect, test, vi } from 'vitest';

import { PrivateLinks } from 'src/components/admin/Settings/PrivateLinks';
import { UrqlConfigProvider } from 'src/context/URQL';
import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';
import { getGqlUrl } from 'src/utils/env-utils';

type DataPlane = DataPlanePrivateLinksQuery['dataPlanes']['edges'][0]['node'];

const api = graphql.link(getGqlUrl());

const AWS_PLANE = 'ops/dp/private/acmeCo/aws-us-east-2-c1';
const DNS_NAME =
    'vpce-0b7c6d5e-k3x9q2wm.vpce-svc-0a1b2c3d4e5f67890.us-east-2.vpce.amazonaws.com';

const awsConfig = {
    __typename: 'AWSPrivateLink' as const,
    serviceName: 'com.amazonaws.vpce.us-east-2.vpce-svc-0a1b2c3d4e5f67890',
    region: 'us-east-2',
    serviceRegion: null,
    azIds: ['use2-az1', 'use2-az2'],
};
const pendingLink = (
    id: string,
    config: PrivateLink['config'] = awsConfig
): PrivateLink => ({
    __typename: 'PrivateLink',
    id,
    config,
    detail: null,
    createdAt: '2026-06-01T10:00:00Z',
    observedAt: null,
    status: 'PENDING',
    error: null,
    details: null,
});

const numberedLink = (n: number) => {
    const id = n.toString(16).padStart(8, '0');
    return {
        ...pendingLink(id, {
            ...awsConfig,
            serviceName: `com.amazonaws.vpce.us-east-2.vpce-svc-${id}`,
        }),
        detail: `Database ${n}`,
        createdAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
    };
};

const provisioned: PrivateLink = {
    ...pendingLink('01'),
    detail: 'Orders database',
    createdAt: '2026-10-11T12:00:00Z',
    status: 'PROVISIONED',
    details: { dns_entries: [{ dns_name: DNS_NAME }] },
};
const failed: PrivateLink = {
    ...pendingLink('02', {
        ...awsConfig,
        serviceName: 'com.amazonaws.vpce.us-east-2.vpce-svc-04d2c1b0a9f8e7d65',
        azIds: ['use2-az9'],
    }),
    detail: 'Analytics',
    status: 'FAILED',
    error: "Invalid PrivateLink Availability Zone ID 'use2-az9'",
};

const awsPlane = (privateLinks: PrivateLink[]): DataPlane => ({
    __typename: 'DataPlane',
    name: AWS_PLANE,
    cloudProvider: 'AWS',
    region: 'us-east-2',
    fqdn: 'aws-private.example',
    cidrBlocks: [],
    privateLinks,
});

let planes: DataPlane[];
let bundles: CapabilityBundle[];

const linksData = (): DataPlanePrivateLinksQuery => ({
    dataPlanes: {
        __typename: 'DataPlaneConnection',
        edges: planes.map((node) => ({ __typename: 'DataPlaneEdge', node })),
    },
});

function mockMutation(
    operation: string,
    data: Record<string, unknown>,
    nextPlanes: DataPlane[]
) {
    const requests: unknown[] = [];
    server.use(
        api.mutation(operation, ({ variables }) => {
            requests.push(variables);
            planes = nextPlanes;
            return HttpResponse.json({ data });
        })
    );
    return requests;
}

const addResult = {
    addDataPlanePrivateLink: { __typename: 'PrivateLink', id: '03' },
};

const retryFailures = (operation: string, message: string) => [
    {
        message,
        handler: api.mutation(
            operation,
            () => HttpResponse.json({ data: null, errors: [{ message }] }),
            { once: true }
        ),
    },
    {
        message: 'Your session expired. Please log in again to continue.',
        handler: api.mutation(
            operation,
            () => HttpResponse.json(null, { status: 401 }),
            { once: true }
        ),
    },
];

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en">
        <UrqlConfigProvider>{children}</UrqlConfigProvider>
    </IntlProvider>
);

const renderLinks = async () => {
    render(<PrivateLinks tenant="acmeCo/" />, { wrapper });
    await screen.findByRole('heading', { name: 'Private data planes' });
    await waitFor(() =>
        expect(screen.queryByText('Loading private data planes…')).toBeNull()
    );
};

const openLink = async (name: string) => {
    fireEvent.click(
        await screen.findByRole('row', {
            name: `Details for ${name}`,
        })
    );
    return screen.findByRole('dialog');
};

const linkRowNames = () =>
    within(screen.getByRole('table', { name: 'Private links' }))
        .getAllByRole('row', { name: /^Details for / })
        .map((row) => row.getAttribute('aria-label'));

const field = (dialog: HTMLElement, label: string) =>
    within(dialog).getByLabelText(label) as HTMLInputElement;

const fill = (dialog: HTMLElement, label: string, value: string) =>
    fireEvent.change(field(dialog, label), { target: { value } });

// Returns a function that runs the section's 15-second refresh now.
const spyOnRefresh = () => {
    const intervals = vi.spyOn(globalThis, 'setInterval');

    return () =>
        act(() => {
            const interval = intervals.mock.calls.find(
                ([, delay]) => delay === 15000
            );
            expect(interval).toBeDefined();
            (interval![0] as () => void)();
        });
};

beforeEach(() => {
    dropFetchSignals();
    planes = [awsPlane([provisioned, failed])];
    bundles = [
        'ViewDataPlanePrivateNetworking',
        'ModifyDataPlanePrivateNetworking',
    ];
    server.use(
        api.query('DataPlanePrivateLinks', () =>
            HttpResponse.json({ data: linksData() })
        ),
        api.query('Capabilities', () =>
            HttpResponse.json({
                data: {
                    prefixes: {
                        __typename: 'PrefixRefConnection',
                        edges: [
                            {
                                __typename: 'PrefixRefEdge',
                                node: {
                                    __typename: 'PrefixRef',
                                    capabilities: bundles,
                                },
                            },
                        ],
                    },
                },
            })
        )
    );
});

test('sorts and searches all links before paginating the matches', async () => {
    const links = Array.from({ length: 57 }, (_, i) => numberedLink(i + 1));
    const labels = links.map(({ detail }) => `Details for ${detail}`).reverse();
    planes = [awsPlane(links)];
    await renderLinks();

    const pager = within(
        screen.getByRole('navigation', { name: 'private links pagination' })
    );
    expect(linkRowNames()).toEqual(labels.slice(0, 10));

    fireEvent.click(pager.getByRole('button', { name: 'next page' }));
    expect(linkRowNames()).toEqual(labels.slice(10, 20));

    fireEvent.click(pager.getByRole('button', { name: 'last page' }));
    expect(pager.getByText('51–57 of 57')).toBeTruthy();
    expect(linkRowNames()).toEqual(labels.slice(50));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
        8
    );

    const created = screen.getByRole('columnheader', { name: 'Created at' });
    expect(created.getAttribute('aria-sort')).toBe('descending');
    fireEvent.click(within(created).getByRole('button'));
    expect(created.getAttribute('aria-sort')).toBe('ascending');
    expect(linkRowNames()).toEqual(labels.slice(-10).reverse());

    const search = screen.getByRole('textbox', {
        name: 'Search private links',
    });
    fireEvent.change(search, { target: { value: '  VPCE-SVC-00000039  ' } });
    expect(linkRowNames()).toEqual(['Details for Database 57']);
    expect(
        screen.queryByRole('navigation', { name: 'private links pagination' })
    ).toBeNull();
    fireEvent.change(search, { target: { value: 'unknown service' } });
    expect(
        screen.getByText('No private links match your search.')
    ).toBeTruthy();
    fireEvent.change(search, { target: { value: '' } });
    expect(linkRowNames()).toEqual(labels.slice(-10).reverse());
});

test('does not refresh while a form is open, then follows the status change', async () => {
    const refresh = spyOnRefresh();
    const requested = vi.fn();
    planes = [
        awsPlane([
            { ...pendingLink('01'), detail: provisioned.detail },
            failed,
        ]),
    ];
    server.use(
        api.query('DataPlanePrivateLinks', () => {
            requested();
            return HttpResponse.json({ data: linksData() });
        })
    );
    await renderLinks();

    const pendingRow = screen.getByRole('row', {
        name: 'Details for Orders database',
    });
    pendingRow.focus();
    fireEvent.keyDown(pendingRow, { key: ' ' });
    const details = await screen.findByRole('dialog');
    fireEvent.click(within(details).getByRole('button', { name: 'Edit' }));
    const form = await screen.findByRole('dialog');
    refresh();
    fireEvent.click(within(form).getByRole('button', { name: 'Cancel' }));
    expect(
        await screen.findByText('Setting up this private link')
    ).toBeTruthy();

    planes = [awsPlane([provisioned, failed])];
    refresh();
    expect(
        await within(screen.getByRole('dialog')).findByText(DNS_NAME)
    ).toBeTruthy();
    // The first load, and the refresh after the form closed.
    expect(requested).toHaveBeenCalledTimes(2);
});

test('says nothing about private data planes after a failed load or refresh', async () => {
    const refresh = spyOnRefresh();
    const failNextRead = () =>
        server.use(
            api.query(
                'DataPlanePrivateLinks',
                () =>
                    HttpResponse.json({ errors: [{ message: 'unavailable' }] }),
                { once: true }
            )
        );
    failNextRead();
    const { container } = render(<PrivateLinks tenant="acmeCo/" />, {
        wrapper,
    });
    expect(screen.getByRole('status').textContent).toBe(
        'Loading private data planes…'
    );
    await waitFor(() => expect(container.innerHTML).toBe(''));

    refresh();
    expect(await screen.findByText('AWS: us-east-2 c1')).toBeTruthy();

    failNextRead();
    refresh();
    await waitFor(() => expect(container.innerHTML).toBe(''));
});

test('shows the no private data plane card and keeps checking for one', async () => {
    const refresh = spyOnRefresh();
    planes = [];
    render(<PrivateLinks tenant="acmeCo/" />, { wrapper });

    expect(
        await screen.findByText('No private data planes for acmeCo/')
    ).toBeTruthy();

    planes = [awsPlane([provisioned, failed])];
    refresh();
    expect(await screen.findByText('AWS: us-east-2 c1')).toBeTruthy();
});

test('Escape closes the form only while nothing has been entered', async () => {
    planes = [awsPlane([])];
    await renderLinks();

    expect(screen.getByText('No private links yet')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    const open = () => {
        fireEvent.click(
            screen.getByRole('button', { name: 'Add private link' })
        );
        return screen.findByRole('dialog', { name: /^Add private link/ });
    };

    fireEvent.keyDown(await open(), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    const dialog = await open();
    fill(dialog, 'Availability Zone IDs', 'use2-az1');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBe(dialog);
});

test('without the bundle to modify, links can be viewed but not changed', async () => {
    bundles = ['ViewDataPlanePrivateNetworking'];
    await renderLinks();

    const dialog = await openLink('Orders database');
    // Edit is offered until the bundles arrive.
    await waitFor(() =>
        expect(
            within(dialog).queryByRole('button', { name: 'Edit' })
        ).toBeNull()
    );

    expect(within(dialog).getByText(DNS_NAME)).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(
        screen.queryByRole('button', { name: 'Add private link' })
    ).toBeNull();
});

test('adds a link once its fields are valid and the server accepts it, then shows it pending', async () => {
    const aws = {
        serviceName: 'com.amazonaws.vpce.eu-west-1.vpce-svc-0f9e8d7c6b5a43210',
        region: 'us-east-2',
        serviceRegion: 'eu-west-1',
        azIds: ['use2-az1', 'use2-az3'],
    };
    const link = {
        ...pendingLink('03', { __typename: 'AWSPrivateLink', ...aws }),
        detail: 'Reporting database',
    };
    const added = mockMutation('AddDataPlanePrivateLink', addResult, [
        awsPlane([provisioned, failed, link]),
    ]);
    await renderLinks();

    fireEvent.click(
        await screen.findByRole('button', { name: 'Add private link' })
    );
    const dialog = await screen.findByRole('dialog');
    const submit = () =>
        fireEvent.click(
            within(dialog).getByRole('button', { name: 'Add private link' })
        );

    fill(dialog, 'Name (optional)', ' Reporting database ');
    fill(dialog, 'Endpoint service name', aws.serviceName);
    fill(dialog, 'Service region (optional)', aws.serviceRegion);
    submit();
    expect(
        within(dialog).getByText('Enter at least one Availability Zone ID.')
    ).toBeTruthy();
    expect(added).toEqual([]);

    const zones = '[use2-az1, use2-az3]';
    fill(dialog, 'Availability Zone IDs', zones);

    const failures = retryFailures(
        'AddDataPlanePrivateLink',
        'data plane not found'
    );
    for (const { message, handler } of failures) {
        server.use(handler);
        submit();
        expect(await within(dialog).findByText(message)).toBeTruthy();
        expect(field(dialog, 'Availability Zone IDs').value).toBe(zones);
    }
    submit();

    const details = await screen.findByRole('dialog', {
        name: /Reporting database/,
    });
    expect(within(details).getByText('Setting up')).toBeTruthy();
    expect(
        within(details).getByText('Setting up this private link')
    ).toBeTruthy();
    expect(added).toEqual([
        {
            dataPlaneName: AWS_PLANE,
            config: { aws },
            detail: 'Reporting database',
        },
    ]);
});

test.each(['Ledger database', ''])(
    'saves the name %j with the exact stored configuration',
    async (detail) => {
        const azureConfig = {
            serviceName:
                '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Sql/servers/mydb',
            location: 'eastus',
            resourceType: null,
            dnsName: '',
        };
        const existing = {
            ...provisioned,
            config: { __typename: 'AzurePrivateLink' as const, ...azureConfig },
            details: { ip: '10.2.0.3' },
        };
        const plane: DataPlane = {
            ...awsPlane([existing]),
            name: 'ops/dp/private/acmeCo/azure-eastus-c1',
            cloudProvider: 'AZURE',
            region: 'eastus',
        };
        planes = [plane];
        const link = { ...existing, detail };
        const updated = mockMutation(
            'UpdateDataPlanePrivateLink',
            { updateDataPlanePrivateLink: link },
            [{ ...plane, privateLinks: [link] }]
        );
        await renderLinks();
        const details = await openLink('Orders database');
        fireEvent.click(within(details).getByRole('button', { name: 'Edit' }));
        const form = await screen.findByRole('dialog', {
            name: /^Edit private link/,
        });
        expect(field(form, 'Name (optional)').value).toBe('Orders database');
        fill(form, 'Name (optional)', detail);
        fireEvent.click(
            within(form).getByRole('button', { name: 'Save changes' })
        );
        const saved = await screen.findByRole('dialog', {
            name: new RegExp(detail || 'mydb'),
        });
        expect(within(saved).getByText('10.2.0.3')).toBeTruthy();
        expect(updated).toStrictEqual([
            { id: link.id, detail, config: { azure: azureConfig } },
        ]);
    }
);

test('deletes a link after confirmation, which stays open to retry a failure', async () => {
    const removed = mockMutation(
        'RemoveDataPlanePrivateLink',
        { removeDataPlanePrivateLink: '01' },
        [awsPlane([failed])]
    );
    await renderLinks();

    const details = await openLink('Orders database');
    fireEvent.click(within(details).getByRole('button', { name: 'Delete' }));

    const confirm = await screen.findByRole('dialog');
    const remove = () =>
        fireEvent.click(
            within(confirm).getByRole('button', { name: 'Delete private link' })
        );

    const failures = retryFailures(
        'RemoveDataPlanePrivateLink',
        'link is being updated'
    );
    for (const { message, handler } of failures) {
        server.use(handler);
        remove();
        expect(await within(confirm).findByText(message)).toBeTruthy();
        expect(screen.getByRole('dialog')).toBe(confirm);
        expect(removed).toEqual([]);
    }

    remove();
    await waitFor(() =>
        expect(linkRowNames()).toEqual(['Details for Analytics'])
    );
    expect(
        screen.queryByRole('row', {
            name: 'Details for Orders database',
        })
    ).toBeNull();
    expect(removed).toEqual([{ id: '01' }]);
    expect(screen.queryByRole('dialog')).toBeNull();
});
