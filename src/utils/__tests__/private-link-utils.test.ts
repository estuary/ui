import type { PrivateLinkConfig } from 'src/utils/private-link-utils';

import { describe, expect, test } from 'vitest';

import {
    getConfigInput,
    getInitialForm,
    getPrivateLinkEndpoint,
    getPrivateLinkServiceLabel,
    parseList,
    proposeAwsServiceRegion,
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

const awsForm = getInitialForm(awsConfig);
const azureForm = getInitialForm(azureConfig);
const gcpForm = getInitialForm(gcpConfig);
const awsChinaService = 'cn.com.amazonaws.vpce.cn-north-1.vpce-svc-0abc';
const awsS3Service = 'com.amazonaws.us-east-2.s3';
const gcpAttachmentUrl = `https://www.googleapis.com/compute/v1/${gcpConfig.serviceAttachment}`;

test('parseList splits pasted lists and drops repeats', () => {
    expect(parseList('[use1-az1, use1-az2]')).toEqual(['use1-az1', 'use1-az2']);
    expect(parseList('"use1-az1"\nuse1-az2;use1-az1  ')).toEqual([
        'use1-az1',
        'use1-az2',
    ]);
    expect(parseList('  ')).toEqual([]);
});

test.each([
    ['Enter the endpoint service name.', awsForm, 'serviceName', ' '],
    ['Enter at least one Availability Zone ID.', awsForm, 'azIds', ','],
    [
        'Enter the resource ID of the Private Link service or Azure resource.',
        azureForm,
        'serviceName',
        ' ',
    ],
    ['Enter the service attachment URI.', gcpForm, 'serviceName', ' '],
    ['Enter a DNS zone name.', gcpForm, 'dnsZoneName', ' '],
    ['Enter at least one DNS record name.', gcpForm, 'dnsRecordNames', ','],
] as const)('reports "%s" for empty input', (message, form, field, value) => {
    expect(validateForm({ ...form, [field]: value })).toEqual({
        [field]: message,
    });
});

test.each([
    { ...awsForm, serviceName: awsChinaService, azIds: 'usw2-lax1-az1' },
    {
        ...azureForm,
        serviceName: 'orders.0000.eastus.azure.privatelinkservice',
        dnsName: 'orders',
    },
    {
        ...gcpForm,
        serviceName: gcpAttachmentUrl,
        dnsZoneName: 'acme.internal.',
        dnsRecordNames: '_orders._tcp',
    },
])('accepts non-empty $provider fields', (form) => {
    expect(validateForm(form)).toEqual({});
});

test.each([
    [awsChinaService, 'cn-north-1'],
    [awsConfig.serviceName, ''],
    [awsS3Service, ''],
])('proposes a service region for %s', (serviceName, expected) => {
    expect(proposeAwsServiceRegion(serviceName, awsConfig.region)).toBe(
        expected
    );
});

test.each([
    [' eu-west-1 ', 'eu-west-1'],
    ['', null],
    [' us-east-2 ', null],
] as const)('uses the AWS service region %j', (serviceRegion, expected) => {
    const form = { ...awsForm, serviceName: awsChinaService, serviceRegion };
    expect(getConfigInput(form, awsConfig.region).aws?.serviceRegion).toBe(
        expected
    );
});

test.each([
    [gcpConfig.serviceAttachment, 'us-central1'],
    [gcpAttachmentUrl, 'us-central1'],
    ['orders-db', 'us-east1'],
])('creates the GCP endpoint for %s in %s', (serviceName, region) => {
    expect(
        getConfigInput({ ...gcpForm, serviceName }, 'us-east1').gcp
    ).toMatchObject({
        serviceAttachment: serviceName,
        region,
        allPorts: false,
    });
});

test('editing preserves locked fields and settings the form omits', () => {
    const existingAws: PrivateLinkConfig = {
        ...awsConfig,
        region: 'us-west-2',
        serviceRegion: 'us-east-2',
        azIds: ['usw2-az1'],
    };
    expect(getInitialForm(existingAws).serviceRegion).toBe('us-east-2');
    expect(
        getConfigInput(
            { ...awsForm, azIds: 'usw2-az2' },
            'us-east-2',
            existingAws
        ).aws
    ).toEqual({
        serviceName: awsConfig.serviceName,
        region: 'us-west-2',
        serviceRegion: 'us-east-2',
        azIds: ['usw2-az2'],
    });

    const existingGcp: PrivateLinkConfig = { ...gcpConfig, allPorts: true };
    expect(
        getConfigInput(
            { ...gcpForm, dnsRecordNames: 'database, replica' },
            'us-east1',
            existingGcp
        ).gcp
    ).toEqual({
        serviceAttachment: gcpConfig.serviceAttachment,
        region: 'us-central1',
        dnsZoneName: 'acme-links',
        dnsRecordNames: ['database', 'replica'],
        allPorts: true,
    });
});

test.each([
    [{ ...awsConfig, serviceName: awsChinaService }, 'vpce-svc-0abc'],
    [{ ...awsConfig, serviceName: awsS3Service }, awsS3Service],
    [azureConfig, 'orders-db'],
    [gcpConfig, 'orders-db'],
] as const)('gets the service label for %j', (config, label) => {
    expect(getPrivateLinkServiceLabel(config)).toBe(label);
});

describe('getPrivateLinkEndpoint', () => {
    test('reads AWS DNS names, regional first, and the endpoint ID', () => {
        const regional =
            'vpce-0b7c-k3x9.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com';
        const zonal =
            'vpce-0b7c-k3x9-us-east-2a.vpce-svc-0a1b.us-east-2.vpce.amazonaws.com';
        expect(
            getPrivateLinkEndpoint(awsConfig, {
                dns_entries: [{ dns_name: zonal }, { dns_name: regional }],
            })
        ).toEqual({
            addresses: [
                { label: 'Regional DNS name', value: regional },
                { label: 'DNS name in us-east-2a', value: zonal },
            ],
            awsEndpointId: 'vpce-0b7c',
        });
    });

    test('reads an Azure DNS record and IP address', () => {
        expect(
            getPrivateLinkEndpoint(azureConfig, {
                ip: '10.1.0.5',
                dns_record: 'orders-db.acme.internal.',
            }).addresses
        ).toEqual([
            { label: 'DNS name', value: 'orders-db.acme.internal' },
            { label: 'Private IP address', value: '10.1.0.5' },
        ]);

        expect(
            getPrivateLinkEndpoint(azureConfig, {
                ip: '10.1.0.5',
                dns_record: '',
            }).addresses
        ).toEqual([{ label: 'Private IP address', value: '10.1.0.5' }]);
    });

    test('reads GCP DNS names and a private IP address', () => {
        expect(
            getPrivateLinkEndpoint(gcpConfig, {
                ip_address: '10.128.0.100',
                dns_zone_name: 'acme-links',
                dns_record_names: ['orders-db', 'orders-replica'],
            }).addresses
        ).toEqual([
            { label: 'DNS name', value: 'orders-db.acme-links' },
            { label: 'DNS name', value: 'orders-replica.acme-links' },
            { label: 'Private IP address', value: '10.128.0.100' },
        ]);
    });

    test.each([
        ['null', null],
        ['a string', 'ready'],
        ['another shape', { endpoints: [{ host: 'example.com' }] }],
        ['malformed entries', { dns_entries: [null, { dns_name: 7 }] }],
    ])('yields nothing for %s', (_case, details) => {
        expect(getPrivateLinkEndpoint(awsConfig, details).addresses).toEqual(
            []
        );
    });
});
