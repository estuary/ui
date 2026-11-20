import type { ReactNode } from 'react';
import type {
    CapabilityBundle,
    DataPlanePrivateLinksQuery,
    DataPlanesQuery,
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
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { beforeEach, expect, test, vi } from 'vitest';

import { DataPlanes } from 'src/components/admin/Settings/DataPlanes';
import { PrivateLinks } from 'src/components/admin/Settings/PrivateLinks';
import { UrqlConfigProvider } from 'src/context/URQL';
import { useTenantStore } from 'src/stores/Tenant';
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
    status: 'PENDING',
    error: null,
    details: null,
});

const numberedLink = (n: number) => {
    const id = n.toString(16).padStart(8, '0');
    return pendingLink(id, {
        ...awsConfig,
        serviceName: `com.amazonaws.vpce.us-east-2.vpce-svc-${id}`,
    });
};

const provisioned: PrivateLink = {
    ...pendingLink('01'),
    status: 'PROVISIONED',
    details: { dns_entries: [{ dns_name: DNS_NAME }] },
};
const failed: PrivateLink = {
    ...pendingLink('02', {
        ...awsConfig,
        serviceName: 'com.amazonaws.vpce.us-east-2.vpce-svc-04d2c1b0a9f8e7d65',
    }),
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

const openLink = async (serviceId: string) => {
    fireEvent.click(
        await screen.findByRole('button', {
            name: `Details for ${serviceId}`,
        })
    );
    return screen.findByRole('dialog');
};

const linkButtonNames = () =>
    within(screen.getByRole('table', { name: 'Private links' }))
        .getAllByRole('button', { name: /^Details for / })
        .map((button) => button.getAttribute('aria-label'));

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

test('puts copy actions and setup states in the endpoint address column', async () => {
    const user = userEvent.setup();
    const writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue();
    await renderLinks();

    const [headers, provisionedRow, failedRow] =
        await screen.findAllByRole('row');
    expect(within(headers).queryByText('Status')).toBeNull();
    expect(within(headers).getByText('Endpoint ID')).toBeTruthy();
    expect(screen.getByText('AWS: us-east-2 c1')).toBeTruthy();
    expect(screen.getByText('US East (Ohio)')).toBeTruthy();
    expect(within(provisionedRow).queryByText(DNS_NAME)).toBeNull();
    expect(within(provisionedRow).getByText('vpce-0b7c6d5e')).toBeTruthy();
    await user.click(
        within(provisionedRow).getByRole('button', { name: 'Copy DNS name' })
    );
    expect(writeText).toHaveBeenCalledWith(DNS_NAME);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(failedRow).getByText('Failed')).toBeTruthy();

    const details = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    const endpoint = within(details)
        .getByText('Regional DNS name')
        .closest('dl')!;
    expect(within(endpoint).getByText(DNS_NAME)).toBeTruthy();
    expect(within(endpoint).getByText('vpce-0b7c6d5e')).toBeTruthy();
    expect(
        within(endpoint).getByRole('button', { name: 'Copy Regional DNS name' })
    ).toBeTruthy();
    expect(
        within(endpoint).getByRole('button', { name: 'About Endpoint ID' })
    ).toBeTruthy();
    const footer = within(details).getByRole('button', {
        name: 'Edit',
    }).parentElement!;
    expect(
        within(footer)
            .getAllByRole('button')
            .map((button) => button.textContent)
    ).toEqual(['Delete', 'Edit']);
    fireEvent.click(within(details).getByRole('button', { name: 'Close' }));

    const error = await openLink('vpce-svc-04d2c1b0a9f8e7d65');
    expect(within(error).getByText('Failed')).toBeTruthy();
    expect(
        within(error).getByText(
            "Invalid PrivateLink Availability Zone ID 'use2-az9'"
        )
    ).toBeTruthy();
});

test('opens the first plane by default and shows links for the selected plane', async () => {
    planes = [1, 2, 3].map((n) => ({
        ...awsPlane([numberedLink(n)]),
        name: `ops/dp/private/acmeCo/aws-us-east-2-c${n}`,
    }));
    await renderLinks();

    const first = screen.getByRole('button', { name: /^AWS: us-east-2 c1/ });
    const third = screen.getByRole('button', { name: /^AWS: us-east-2 c3/ });
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(third.getAttribute('aria-expanded')).toBe('false');
    expect(linkButtonNames()).toEqual(['Details for vpce-svc-00000001']);

    fireEvent.click(third);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(third.getAttribute('aria-expanded')).toBe('true');
    expect(linkButtonNames()).toEqual(['Details for vpce-svc-00000003']);
});

test('paginates private links on a large single plane', async () => {
    const links = Array.from({ length: 57 }, (_, i) => numberedLink(i + 1));
    const labels = links.map(({ id }) => `Details for vpce-svc-${id}`);
    planes = [awsPlane(links)];
    await renderLinks();

    const pager = within(
        screen.getByRole('navigation', { name: 'private links pagination' })
    );
    expect(linkButtonNames()).toEqual(labels.slice(0, 10));

    fireEvent.click(pager.getByRole('button', { name: 'next page' }));
    expect(linkButtonNames()).toEqual(labels.slice(10, 20));

    fireEvent.click(pager.getByRole('button', { name: 'last page' }));
    expect(pager.getByText('51–57 of 57')).toBeTruthy();
    expect(linkButtonNames()).toEqual(labels.slice(50));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
        8
    );
});

test('shows IPv4 in the public table and both IP families in plane details', async () => {
    useTenantStore.setState({ selectedTenant: 'acmeCo/' });
    const publicData: DataPlanesQuery = {
        dataPlanes: {
            __typename: 'DataPlaneConnection',
            edges: [
                {
                    __typename: 'DataPlaneEdge',
                    node: {
                        __typename: 'DataPlane',
                        name: 'ops/dp/public/aws-us-east-1-c1',
                        cloudProvider: 'AWS',
                        region: 'us-east-1',
                        isPublic: true,
                        closed: false,
                        fqdn: 'example.estuary.dev',
                        cidrBlocks: ['192.0.2.10/32', '2001:db8:10::/64'],
                        awsIamUserArn: null,
                        gcpServiceAccountEmail: null,
                        azureApplicationClientId: null,
                        azureApplicationName: null,
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
    };
    server.use(
        api.query('DataPlanes', () => HttpResponse.json({ data: publicData }))
    );
    render(<DataPlanes />, { wrapper });

    const table = await screen.findByRole('table', {
        name: 'Public data planes',
    });
    expect(
        await within(table).findByText('US East (N. Virginia)')
    ).toBeTruthy();
    expect(within(table).getByText('192.0.2.10/32')).toBeTruthy();
    expect(within(table).queryByText('IPv6 egress')).toBeNull();
    expect(within(table).queryByText('2001:db8:10::/64')).toBeNull();
    fireEvent.click(
        within(table).getByRole('button', {
            name: 'Details for AWS: us-east-1 c1',
        })
    );
    const details = await screen.findByRole('dialog');
    expect(within(details).getByText('192.0.2.10/32')).toBeTruthy();
    expect(within(details).getByText('2001:db8:10::/64')).toBeTruthy();
});

test('does not refresh while a form is open, then follows the status change', async () => {
    const refresh = spyOnRefresh();
    const requested = vi.fn();
    planes = [awsPlane([pendingLink('01'), failed])];
    server.use(
        api.query('DataPlanePrivateLinks', () => {
            requested();
            return HttpResponse.json({ data: linksData() });
        })
    );
    await renderLinks();

    const details = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    fireEvent.click(within(details).getByRole('button', { name: 'Edit' }));
    const form = await screen.findByRole('dialog');
    refresh();
    fireEvent.click(within(form).getByRole('button', { name: 'Cancel' }));
    expect(await screen.findByText('Setting up this link')).toBeTruthy();

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

test('a tenant with no private data plane is pointed to private deployments', async () => {
    const refresh = spyOnRefresh();
    planes = [];
    render(<PrivateLinks tenant="acmeCo/" />, { wrapper });

    expect(
        await screen.findByText('No private data planes for acmeCo/')
    ).toBeTruthy();
    expect(
        screen
            .getByRole('link', { name: 'Learn about private deployments' })
            .getAttribute('href')
    ).toBe('https://docs.estuary.dev/private-byoc/');
    expect(
        screen.getByRole('link', { name: 'Contact us' }).getAttribute('href')
    ).toBe('https://estuary.dev/contact-us');
    expect(
        screen.queryByRole('link', { name: /Private link guide/ })
    ).toBeNull();

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

    const dialog = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    // Edit is offered until the bundles arrive.
    await waitFor(() =>
        expect(
            within(dialog).queryByRole('button', { name: 'Edit' })
        ).toBeNull()
    );

    expect(within(dialog).getByText(DNS_NAME)).toBeTruthy();
    expect(within(dialog).getByText('vpce-0b7c6d5e')).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(
        screen.queryByRole('button', { name: 'Add private link' })
    ).toBeNull();
});

test('offers the actions when the bundles cannot be loaded', async () => {
    let answered = false;
    server.use(
        api.query('Capabilities', () => {
            answered = true;
            return HttpResponse.json({ errors: [{ message: 'unavailable' }] });
        })
    );
    await renderLinks();
    await waitFor(() => expect(answered).toBe(true));

    const dialog = await openLink('vpce-svc-0a1b2c3d4e5f67890');
    expect(within(dialog).getByRole('button', { name: 'Edit' })).toBeTruthy();
    expect(
        screen.getByRole('button', { name: 'Add private link' })
    ).toBeTruthy();
});

test('adds a link once its fields are valid and the server accepts it, then shows it pending', async () => {
    const aws = {
        serviceName: 'com.amazonaws.vpce.eu-west-1.vpce-svc-0f9e8d7c6b5a43210',
        region: 'us-east-2',
        serviceRegion: 'eu-west-1',
        azIds: ['use2-az1', 'use2-az3'],
    };
    const link = pendingLink('03', { __typename: 'AWSPrivateLink', ...aws });
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

    const regionLabel = 'Service region (optional)';
    fill(dialog, 'Endpoint service name', aws.serviceName);
    expect(field(dialog, regionLabel).value).toBe(aws.serviceRegion);

    fill(dialog, regionLabel, 'us-west-2');
    fill(
        dialog,
        'Endpoint service name',
        'cn.com.amazonaws.vpce.cn-north-1.vpce-svc-0abc'
    );
    expect(field(dialog, regionLabel).value).toBe('us-west-2');

    fill(dialog, regionLabel, 'cn-north-1');
    fill(dialog, 'Endpoint service name', aws.serviceName);
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
        name: /vpce-svc-0f9e8d7c6b5a43210/,
    });
    expect(within(details).getByText('Setting up')).toBeTruthy();
    expect(within(details).getByText('Setting up this link')).toBeTruthy();
    expect(added).toEqual([{ dataPlaneName: AWS_PLANE, config: { aws } }]);
});

test('editing locks the service and sends the update', async () => {
    const aws = {
        serviceName: 'com.amazonaws.vpce.us-east-2.vpce-svc-04d2c1b0a9f8e7d65',
        region: 'us-east-2',
        serviceRegion: null,
        azIds: ['use2-az1', 'use2-az3'],
    };
    const link = pendingLink('02', { __typename: 'AWSPrivateLink', ...aws });
    const updated = mockMutation(
        'UpdateDataPlanePrivateLink',
        { updateDataPlanePrivateLink: link },
        [awsPlane([provisioned, link])]
    );
    await renderLinks();

    const details = await openLink('vpce-svc-04d2c1b0a9f8e7d65');
    expect(
        within(details).getByText("This link couldn't be set up")
    ).toBeTruthy();

    fireEvent.click(within(details).getByRole('button', { name: 'Edit' }));
    const dialog = await screen.findByRole('dialog');
    expect(field(dialog, 'Endpoint service name').disabled).toBe(true);
    expect(field(dialog, 'Service region (optional)').disabled).toBe(true);

    fill(dialog, 'Availability Zone IDs', 'use2-az1, use2-az3');
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Save changes' })
    );

    await screen.findByText('Setting up this link');
    expect(updated).toEqual([{ id: '02', config: { aws } }]);
});

test('deletes a link after confirmation, which stays open to retry a failure', async () => {
    const removed = mockMutation(
        'RemoveDataPlanePrivateLink',
        { removeDataPlanePrivateLink: '01' },
        [awsPlane([failed])]
    );
    await renderLinks();

    const details = await openLink('vpce-svc-0a1b2c3d4e5f67890');
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
        expect(planes[0].privateLinks).toEqual([provisioned, failed]);
    }

    remove();
    await waitFor(() =>
        expect(linkButtonNames()).toEqual([
            'Details for vpce-svc-04d2c1b0a9f8e7d65',
        ])
    );
    expect(
        screen.queryByRole('button', {
            name: 'Details for vpce-svc-0a1b2c3d4e5f67890',
        })
    ).toBeNull();
    expect(removed).toEqual([{ id: '01' }]);
    expect(screen.queryByRole('dialog')).toBeNull();
});

test('creates an Azure link with its resource type and DNS name', async () => {
    const name = 'ops/dp/private/acmeCo/azure-eastus-c1';
    const azurePlane: DataPlane = {
        ...awsPlane([]),
        name,
        cloudProvider: 'AZURE',
        region: 'eastus',
    };
    const azure = {
        serviceName:
            '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Sql/servers/mydb',
        location: 'eastus',
        resourceType: 'sqlServer',
        dnsName: 'mydb.database.windows.net',
    };
    const otherPlane = awsPlane([provisioned, failed]);
    planes = [azurePlane, otherPlane];
    const link = pendingLink('03', {
        __typename: 'AzurePrivateLink',
        ...azure,
    });
    const added = mockMutation('AddDataPlanePrivateLink', addResult, [
        { ...azurePlane, privateLinks: [link] },
        otherPlane,
    ]);
    await renderLinks();
    fireEvent.click(screen.getByRole('button', { name: 'Add private link' }));
    const dialog = await screen.findByRole('dialog');
    fill(dialog, 'Sub-resource type (optional)', azure.resourceType);
    fill(dialog, 'Resource ID', azure.serviceName);
    fill(dialog, 'DNS name (optional)', azure.dnsName);
    fireEvent.click(
        within(dialog).getByRole('button', { name: 'Add private link' })
    );
    const details = await screen.findByRole('dialog', { name: /mydb/ });
    expect(within(details).getByText('Setting up this link')).toBeTruthy();
    expect(added).toEqual([{ dataPlaneName: name, config: { azure } }]);

    fireEvent.click(within(details).getByRole('button', { name: 'Close' }));
    fireEvent.click(
        await screen.findByRole('button', { name: /^AWS: us-east-2 c1/ })
    );
    expect(linkButtonNames()).toEqual([
        'Details for vpce-svc-0a1b2c3d4e5f67890',
        'Details for vpce-svc-04d2c1b0a9f8e7d65',
    ]);
});
