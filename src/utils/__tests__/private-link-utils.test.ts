import type {
    PrivateLinkConfig,
    PrivateLinkForm,
} from 'src/utils/private-link-utils';

import { describe, expect, test } from 'vitest';

import {
    getAwsZoneIdPrefix,
    getConfigInput,
    getFormFromConfig,
    getLinkAddress,
    getLinkEndpoint,
    getLinkServiceLabel,
    isConfigChanged,
    parseList,
    validateForm,
} from 'src/utils/private-link-utils';

const awsConfig: PrivateLinkConfig = {
    __typename: 'AWSPrivateLink',
    serviceName: 'com.amazonaws.vpce.us-east-2.vpce-svc-0a1b2c3d4e5f67890',
    region: 'us-east-2',
    serviceRegion: null,
    azIds: ['use2-az1', 'use2-az2'],
};
const azureConfig: PrivateLinkConfig = {
    __typename: 'AzurePrivateLink',
    serviceName:
        '/subscriptions/0000/resourceGroups/acme/providers/Microsoft.Network/privateLinkServices/orders-db',
    location: 'eastus',
    resourceType: null,
    dnsName: null,
};
const gcpConfig: PrivateLinkConfig = {
    __typename: 'GCPPrivateServiceConnect',
    serviceAttachment:
        'projects/acme/regions/us-central1/serviceAttachments/orders-db',
    region: 'us-central1',
    dnsZoneName: 'acme-links',
    dnsRecordNames: ['orders-db'],
    allPorts: false,
};

const awsForm = (fields: Partial<PrivateLinkForm> = {}) =>
    ({ ...getFormFromConfig(awsConfig), ...fields }) as PrivateLinkForm;
const azureForm = (fields: Partial<PrivateLinkForm> = {}) =>
    ({ ...getFormFromConfig(azureConfig), ...fields }) as PrivateLinkForm;
const gcpForm = (fields: Partial<PrivateLinkForm> = {}) =>
    ({ ...getFormFromConfig(gcpConfig), ...fields }) as PrivateLinkForm;

test('parseList splits pasted lists and drops repeats', () => {
    expect(parseList('[use1-az1, use1-az2]')).toEqual(['use1-az1', 'use1-az2']);
    expect(parseList('"use1-az1"\nuse1-az2;use1-az1  ')).toEqual([
        'use1-az1',
        'use1-az2',
    ]);
    expect(parseList('  ')).toEqual([]);
});

test.each([
    ['us-east-1', 'use1'],
    ['eu-central-1', 'euc1'],
    ['ap-southeast-2', 'apse2'],
    ['ap-northeast-1', 'apne1'],
    ['us-gov-west-1', 'usgw1'],
    ['us-east', null],
    ['xx-middle-1', null],
])('getAwsZoneIdPrefix abbreviates %s to %s', (region, prefix) => {
    expect(getAwsZoneIdPrefix(region)).toBe(prefix);
});

test.each([
    ['a service ID alone', 'vpce-svc-0a1b2c3d4e5f67890', /full service name/],
    ['an AWS-owned service', 'com.amazonaws.us-east-2.s3', /look like/],
    ['nothing', ' ', /Enter the endpoint service name/],
])('an AWS service name rejects %s', (_case, serviceName, message) => {
    const errors = validateForm(awsForm({ serviceName }), {
        region: 'us-east-2',
    });
    expect(errors.serviceName).toMatch(message);
});

test.each([
    ['a zone name', 'us-east-2a', /zone name.*like use2-az1/],
    ['a zone of another region', 'use1-az1', /not in us-east-2/],
    ['a malformed zone', 'az1', /not an Availability Zone ID/],
    ['nothing', '', /at least one/],
])('AWS zone IDs reject %s', (_case, azIds, message) => {
    const errors = validateForm(awsForm({ azIds }), { region: 'us-east-2' });
    expect(errors.azIds).toMatch(message);
});

test('AWS zone IDs are those of the endpoint region, also across regions', () => {
    const serviceName =
        'com.amazonaws.vpce.eu-west-1.vpce-svc-0a1b2c3d4e5f67890';

    expect(
        validateForm(awsForm({ serviceName, azIds: 'use2-az1' }), {
            region: 'us-east-2',
        })
    ).toEqual({});
    expect(
        validateForm(awsForm({ serviceName, azIds: 'euw1-az1' }), {
            region: 'us-east-2',
        }).azIds
    ).toMatch(/not in us-east-2/);
});

test('zone IDs of a region that cannot be abbreviated are only checked for shape', () => {
    expect(
        validateForm(awsForm({ azIds: 'xxm1-az1' }), { region: 'xx-middle-1' })
    ).toEqual({});
});

test('a service already linked on the data plane is rejected', () => {
    const errors = validateForm(awsForm(), {
        region: 'us-east-2',
        otherServices: [awsConfig.serviceName.toUpperCase()],
    });
    expect(errors.serviceName).toMatch(/already has a private link/);
});

test('an Azure Private Link service needs no sub-resource, other resources do', () => {
    expect(validateForm(azureForm(), { region: 'eastus' })).toEqual({});

    const sqlServer =
        '/subscriptions/0000/resourceGroups/acme/providers/Microsoft.Sql/servers/reporting';
    expect(
        validateForm(azureForm({ serviceName: sqlServer }), {
            region: 'eastus',
        }).resourceType
    ).toMatch(/sub-resource/);
    expect(
        validateForm(
            azureForm({ serviceName: sqlServer, resourceType: 'sqlServer' }),
            { region: 'eastus' }
        )
    ).toEqual({});
});

test.each([
    ['a bare name', 'orders-db', /Resource IDs look like/],
    [
        'a resource group',
        '/subscriptions/0000/resourceGroups/acme',
        /look like/,
    ],
])('an Azure resource ID rejects %s', (_case, serviceName, message) => {
    const errors = validateForm(azureForm({ serviceName }), {
        region: 'eastus',
    });
    expect(errors.serviceName).toMatch(message);
});

test('an Azure DNS name is optional and must be a multi-label hostname', () => {
    const validate = (dnsName: string) =>
        validateForm(azureForm({ dnsName }), { region: 'eastus' }).dnsName;

    expect(validate('')).toBeUndefined();
    expect(validate('mydb.database.windows.net')).toBeUndefined();
    expect(validate('mydb')).toMatch(/hostname/);
    expect(validate('my db.example.com')).toMatch(/hostname/);
});

test('a GCP link needs a service attachment URI, a zone and record names', () => {
    expect(validateForm(gcpForm(), { region: 'us-central1' })).toEqual({});
    expect(
        validateForm(gcpForm({ dnsRecordNames: '*, *.brokers, db-1' }), {
            region: 'us-central1',
        })
    ).toEqual({});

    expect(
        validateForm(
            gcpForm({
                serviceAttachment: 'orders-db',
                dnsZoneName: 'acme links',
                dnsRecordNames: 'orders_db',
            }),
            { region: 'us-central1' }
        )
    ).toEqual({
        serviceAttachment: expect.stringMatching(/look like/),
        dnsZoneName: expect.stringMatching(/Zone names/),
        dnsRecordNames: expect.stringMatching(/orders_db is not/),
    });
});

test('a service attachment URL is accepted and saved as its path', () => {
    const form = gcpForm({
        serviceAttachment: `https://www.googleapis.com/compute/v1/${gcpConfig.serviceAttachment}`,
    });

    expect(validateForm(form, { region: 'us-central1' })).toEqual({});
    expect(
        validateForm(form, {
            region: 'us-central1',
            otherServices: [gcpConfig.serviceAttachment],
        }).serviceAttachment
    ).toMatch(/already has a private link/);
    expect(getConfigInput(form, 'us-central1').gcp).toMatchObject({
        serviceAttachment: gcpConfig.serviceAttachment,
        region: 'us-central1',
    });
});

test('editing does not check or rewrite the service a link already has', () => {
    // Services written in ways the form would not accept for a new link.
    const existingGcp: PrivateLinkConfig = {
        ...gcpConfig,
        serviceAttachment: `//compute.googleapis.com/${gcpConfig.serviceAttachment}`,
    };
    const existingAws: PrivateLinkConfig = {
        ...awsConfig,
        serviceName: 'com.amazonaws.us-east-2.s3',
    };
    const existingAzure: PrivateLinkConfig = {
        ...azureConfig,
        serviceName: 'orders-db.0000.eastus.azure.privatelinkservice',
    };

    for (const existing of [existingGcp, existingAws, existingAzure]) {
        const form = getFormFromConfig(existing);

        expect(validateForm(form, { region: 'us-east-2' })).not.toEqual({});
        expect(
            validateForm(form, { region: 'us-east-2', serviceLocked: true })
        ).toEqual({});
    }

    // A new link's URL is saved as its path. An existing one stays a URL.
    const asUrl: PrivateLinkConfig = {
        ...gcpConfig,
        serviceAttachment: `https://www.googleapis.com/compute/v1/${gcpConfig.serviceAttachment}`,
    };
    expect(
        getConfigInput(getFormFromConfig(asUrl), 'us-central1', asUrl).gcp
    ).toMatchObject({ serviceAttachment: asUrl.serviceAttachment });

    // The fields that can be edited are still checked.
    expect(
        validateForm(awsForm({ azIds: 'us-east-2a' }), {
            region: 'us-east-2',
            serviceLocked: true,
        }).azIds
    ).toMatch(/zone name/);
});

test('a new AWS link is created in the data plane region', () => {
    expect(getConfigInput(awsForm(), 'us-east-2')).toEqual({
        aws: {
            serviceName: awsConfig.serviceName,
            region: 'us-east-2',
            serviceRegion: null,
            azIds: ['use2-az1', 'use2-az2'],
        },
    });
});

test('a new AWS link to a service in another region is cross-region', () => {
    const serviceName =
        'com.amazonaws.vpce.eu-west-1.vpce-svc-0a1b2c3d4e5f67890';

    expect(
        getConfigInput(awsForm({ serviceName }), 'us-east-2').aws
    ).toMatchObject({ region: 'us-east-2', serviceRegion: 'eu-west-1' });
});

test('a new GCP link is created in the service attachment region', () => {
    expect(getConfigInput(gcpForm(), 'us-east1').gcp).toMatchObject({
        region: 'us-central1',
        allPorts: false,
    });
});

test('editing keeps what the form does not show', () => {
    const existingAws: PrivateLinkConfig = {
        ...awsConfig,
        region: 'us-west-2',
        serviceRegion: 'us-east-2',
        azIds: ['usw2-az1'],
    };
    expect(
        getConfigInput(awsForm({ azIds: 'usw2-az2' }), 'us-east-2', existingAws)
            .aws
    ).toEqual({
        serviceName: awsConfig.serviceName,
        region: 'us-west-2',
        serviceRegion: 'us-east-2',
        azIds: ['usw2-az2'],
    });

    const existingGcp: PrivateLinkConfig = { ...gcpConfig, allPorts: true };
    expect(
        getConfigInput(
            getFormFromConfig(existingGcp),
            'us-central1',
            existingGcp
        ).gcp
    ).toMatchObject({ allPorts: true });
});

test('isConfigChanged ignores formatting and order, and sees real edits', () => {
    expect(
        isConfigChanged(awsForm({ azIds: ' use2-az1,use2-az2 ' }), awsConfig)
    ).toBe(false);
    expect(
        isConfigChanged(awsForm({ azIds: 'use2-az2, use2-az1' }), awsConfig)
    ).toBe(false);
    expect(isConfigChanged(awsForm({ azIds: 'use2-az1' }), awsConfig)).toBe(
        true
    );
    expect(isConfigChanged(azureForm({ dnsName: '' }), azureConfig)).toBe(
        false
    );
    expect(
        isConfigChanged(azureForm({ dnsName: 'db.acme.internal' }), azureConfig)
    ).toBe(true);
});

test('getLinkServiceLabel shortens each kind of service', () => {
    expect(getLinkServiceLabel(awsConfig)).toBe('vpce-svc-0a1b2c3d4e5f67890');
    expect(getLinkServiceLabel(azureConfig)).toBe('orders-db');
    expect(getLinkServiceLabel(gcpConfig)).toBe('orders-db');
});

describe('getLinkEndpoint', () => {
    test('reads AWS DNS names, regional first, and the endpoint ID', () => {
        const endpoint = getLinkEndpoint(awsConfig, {
            service_name: awsConfig.serviceName,
            dns_entries: [
                {
                    dns_name:
                        'vpce-0b7c-k3x9-us-east-2a.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com',
                },
                {
                    dns_name:
                        'vpce-0b7c-k3x9.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com',
                    hosted_zone_id: 'Z1',
                },
            ],
        });

        expect(endpoint).toEqual({
            provider: 'AWS',
            endpointId: 'vpce-0b7c',
            dnsNames: [
                {
                    name: 'vpce-0b7c-k3x9.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com',
                    zone: null,
                },
                {
                    name: 'vpce-0b7c-k3x9-us-east-2a.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com',
                    zone: 'us-east-2a',
                },
            ],
        });
        expect(endpoint && getLinkAddress(endpoint)).toBe(
            'vpce-0b7c-k3x9.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com'
        );
    });

    test('reads an Azure IP address and DNS record', () => {
        const withRecord = getLinkEndpoint(azureConfig, {
            ip: '10.1.0.5',
            dns_record: 'orders-db.acme.internal.',
        });
        expect(withRecord).toEqual({
            provider: 'AZURE',
            ip: '10.1.0.5',
            dnsName: 'orders-db.acme.internal',
        });
        expect(withRecord && getLinkAddress(withRecord)).toBe(
            'orders-db.acme.internal'
        );

        const ipOnly = getLinkEndpoint(azureConfig, {
            ip: '10.1.0.5',
            dns_record: '',
        });
        expect(ipOnly && getLinkAddress(ipOnly)).toBe('10.1.0.5');
    });

    test('reads a GCP IP address and hostnames', () => {
        const endpoint = getLinkEndpoint(gcpConfig, {
            ip_address: '10.128.0.100',
            dns_zone_name: 'acme-links',
            dns_record_names: ['orders-db', 'orders-replica'],
        });

        expect(endpoint).toEqual({
            provider: 'GCP',
            ip: '10.128.0.100',
            hostnames: ['orders-db.acme-links', 'orders-replica.acme-links'],
        });
        expect(endpoint && getLinkAddress(endpoint)).toBe(
            'orders-db.acme-links'
        );
    });

    test.each([
        ['null', null],
        ['a string', 'ready'],
        ['another shape', { endpoints: [{ host: 'example.com' }] }],
        ['malformed entries', { dns_entries: [null, { dns_name: 7 }] }],
    ])('yields null for %s', (_case, details) => {
        expect(getLinkEndpoint(awsConfig, details)).toBeNull();
    });
});
