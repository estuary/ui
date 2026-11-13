import type {
    PrivateLinkConfigInput,
    PrivateLinkFieldsFragment,
} from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { isEqual, uniq } from 'lodash';

export type PrivateLink = PrivateLinkFieldsFragment;
export type PrivateLinkConfig = PrivateLink['config'];

export const PRIVATE_LINK_DOCS_URL =
    'https://docs.estuary.dev/private-byoc/privatelink/';

export const PRIVATE_LINK_PROVIDER_DOCS: Record<CloudProvider, string> = {
    AWS: `${PRIVATE_LINK_DOCS_URL}#aws-privatelink`,
    AZURE: `${PRIVATE_LINK_DOCS_URL}#azure-private-link`,
    GCP: `${PRIVATE_LINK_DOCS_URL}#gcp-private-service-connect`,
};

export const AWS_CROSS_REGION_DOCS_URL = `${PRIVATE_LINK_DOCS_URL}#cross-region`;

export const PRIVATE_LINK_LABELS: Record<CloudProvider, string> = {
    AWS: 'AWS PrivateLink',
    AZURE: 'Azure Private Link',
    GCP: 'GCP Private Service Connect',
};

export function getLinkProvider(config: PrivateLinkConfig): CloudProvider {
    switch (config.__typename) {
        case 'AWSPrivateLink':
            return 'AWS';
        case 'AzurePrivateLink':
            return 'AZURE';
        case 'GCPPrivateServiceConnect':
            return 'GCP';
    }
}

// Where a link's endpoint is created.
export function getLinkRegion(config: PrivateLinkConfig): string {
    return config.__typename === 'AzurePrivateLink'
        ? config.location
        : config.region;
}

// The service a link connects to. The API allows one link per service on a
// data plane.
export function getLinkService(config: PrivateLinkConfig): string {
    return config.__typename === 'GCPPrivateServiceConnect'
        ? config.serviceAttachment
        : config.serviceName;
}

// A short name for the service: `vpce-svc-0abc` for AWS, and the final path
// segment of an Azure resource ID or GCP service attachment.
export function getLinkServiceLabel(config: PrivateLinkConfig): string {
    const service = getLinkService(config);

    if (config.__typename === 'AWSPrivateLink') {
        return parseAwsServiceName(service)?.serviceId ?? service;
    }

    return service.split('/').filter(Boolean).pop() ?? service;
}

// ---------------------------------------------------------------------------
// AWS

const AWS_SERVICE_NAME =
    /^com\.amazonaws\.vpce\.([a-z]{2}(?:-[a-z]+)+-\d+)\.(vpce-svc-[0-9a-f]{8,})$/;

// `us-east-1a`: what the AWS console shows most prominently, and not what the
// API takes.
const AWS_AZ_NAME = /^[a-z]{2}(?:-[a-z]+)+-\d+[a-z]$/;
const AWS_AZ_ID = /^([a-z]{3,}\d+)-az\d+$/;

const AWS_REGION_WORDS: Record<string, string> = {
    central: 'c',
    east: 'e',
    gov: 'g',
    north: 'n',
    northeast: 'ne',
    northwest: 'nw',
    south: 's',
    southeast: 'se',
    southwest: 'sw',
    west: 'w',
};

function parseAwsServiceName(
    serviceName: string
): { region: string; serviceId: string } | null {
    const match = AWS_SERVICE_NAME.exec(serviceName.trim());
    return match ? { region: match[1], serviceId: match[2] } : null;
}

// Zone IDs start with an abbreviation of their region: `us-east-1` -> `use1`,
// `ap-southeast-2` -> `apse2`. Returns null for a region this can't abbreviate,
// in which case zone IDs are not checked against the region.
export function getAwsZoneIdPrefix(region: string): string | null {
    const parts = region.split('-');
    if (parts.length < 3) {
        return null;
    }

    const words = parts.slice(1, -1).map((word) => AWS_REGION_WORDS[word]);
    if (words.some((word) => !word)) {
        return null;
    }

    return `${parts[0]}${words.join('')}${parts[parts.length - 1]}`;
}

// The service's region when it differs from the endpoint's, which makes the
// link cross-region.
export function getAwsCrossRegion(
    serviceName: string,
    region: string
): string | null {
    const serviceRegion = parseAwsServiceName(serviceName)?.region;
    return serviceRegion && serviceRegion !== region ? serviceRegion : null;
}

function validateAwsServiceName(serviceName: string): string | undefined {
    const value = serviceName.trim();

    if (!value) {
        return 'Enter the endpoint service name.';
    }

    if (parseAwsServiceName(value)) {
        return undefined;
    }

    return value.startsWith('vpce-svc-')
        ? 'Enter the full service name, which starts with com.amazonaws.vpce.'
        : 'Service names look like com.amazonaws.vpce.us-east-1.vpce-svc-0123456789abcdef0.';
}

function validateAwsZoneIds(azIds: string, region: string): string | undefined {
    const zones = parseList(azIds);
    const prefix = getAwsZoneIdPrefix(region);
    const example = `${prefix ?? 'use1'}-az1`;

    if (zones.length === 0) {
        return 'Enter at least one Availability Zone ID.';
    }

    for (const zone of zones) {
        if (AWS_AZ_NAME.test(zone)) {
            return `${zone} is a zone name. Enter its zone ID instead, like ${example}.`;
        }

        const match = AWS_AZ_ID.exec(zone);
        if (!match) {
            return `${zone} is not an Availability Zone ID. Zone IDs look like ${example}.`;
        }

        if (prefix && match[1] !== prefix) {
            return `${zone} is not in ${region}. Zone IDs in ${region} start with ${prefix}-.`;
        }
    }

    return undefined;
}

// ---------------------------------------------------------------------------
// Azure

const AZURE_RESOURCE_ID =
    /^\/subscriptions\/[^/\s]+\/resourceGroups\/[^/\s]+\/providers\/[^/\s]+(?:\/[^/\s]+){2,}$/i;

const AZURE_PRIVATE_LINK_SERVICE =
    /\/providers\/Microsoft\.Network\/privateLinkServices\/[^/\s]+$/i;

// A Private Link service is connected to as a whole. Any other resource (a SQL
// server, a storage account) also needs the sub-resource to connect to.
export function isAzurePrivateLinkService(serviceName: string): boolean {
    return AZURE_PRIVATE_LINK_SERVICE.test(serviceName.trim());
}

function validateAzureServiceName(serviceName: string): string | undefined {
    const value = serviceName.trim();

    if (!value) {
        return 'Enter the resource ID of the Private Link service or Azure resource.';
    }

    return AZURE_RESOURCE_ID.test(value)
        ? undefined
        : 'Resource IDs look like /subscriptions/<id>/resourceGroups/<group>/providers/Microsoft.Network/privateLinkServices/<name>.';
}

// ---------------------------------------------------------------------------
// GCP

const GCP_SERVICE_ATTACHMENT =
    /^projects\/([^/\s]+)\/regions\/([a-z0-9-]+)\/serviceAttachments\/([^/\s]+)$/;

// gcloud prints a service attachment as a URL. The path after the API version
// identifies it.
const GCP_API_URL = /^https:\/\/www\.googleapis\.com\/compute\/[a-z0-9]+\//;

function getGcpServiceAttachmentPath(serviceAttachment: string): string {
    return serviceAttachment.trim().replace(GCP_API_URL, '');
}

function parseGcpServiceAttachment(
    serviceAttachment: string
): { region: string; name: string } | null {
    const match = GCP_SERVICE_ATTACHMENT.exec(serviceAttachment);
    return match ? { region: match[2], name: match[3] } : null;
}

function validateGcpServiceAttachment(
    serviceAttachment: string
): string | undefined {
    if (!serviceAttachment) {
        return 'Enter the service attachment URI.';
    }

    return parseGcpServiceAttachment(serviceAttachment)
        ? undefined
        : 'Service attachments look like projects/my-project/regions/us-central1/serviceAttachments/my-attachment.';
}

// The names a GCP link resolves inside the data plane, e.g. `my-database.acme-links`.
export function getGcpHostnames(
    dnsRecordNames: string[],
    dnsZoneName: string
): string[] {
    const zone = dnsZoneName.trim();
    return zone ? dnsRecordNames.map((record) => `${record}.${zone}`) : [];
}

// ---------------------------------------------------------------------------
// Shared

const DNS_LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const HOSTNAME = new RegExp(`^${DNS_LABEL}(?:\\.${DNS_LABEL})*$`, 'i');
// A record may also be a wildcard, like `*` or `*.brokers`.
const DNS_RECORD = new RegExp(
    `^(?:\\*|(?:\\*\\.)?${DNS_LABEL}(?:\\.${DNS_LABEL})*)$`,
    'i'
);

// Splits typed or pasted text like `[use1-az1, use1-az2]` into its entries.
export function parseList(text: string): string[] {
    return uniq(
        text
            .replace(/[[\]"'`]/g, ' ')
            .split(/[\s,;]+/)
            .filter(Boolean)
    );
}

export type PrivateLinkForm =
    | { provider: 'AWS'; serviceName: string; azIds: string }
    | {
          provider: 'AZURE';
          serviceName: string;
          resourceType: string;
          dnsName: string;
      }
    | {
          provider: 'GCP';
          serviceAttachment: string;
          dnsZoneName: string;
          dnsRecordNames: string;
      };

export type PrivateLinkFormField =
    | 'serviceName'
    | 'azIds'
    | 'resourceType'
    | 'dnsName'
    | 'serviceAttachment'
    | 'dnsZoneName'
    | 'dnsRecordNames';

export type PrivateLinkFormErrors = Partial<
    Record<PrivateLinkFormField, string>
>;

export function getEmptyForm(provider: CloudProvider): PrivateLinkForm {
    switch (provider) {
        case 'AWS':
            return { provider, serviceName: '', azIds: '' };
        case 'AZURE':
            return { provider, serviceName: '', resourceType: '', dnsName: '' };
        case 'GCP':
            return {
                provider,
                serviceAttachment: '',
                dnsZoneName: '',
                dnsRecordNames: '',
            };
    }
}

export function getFormFromConfig(config: PrivateLinkConfig): PrivateLinkForm {
    switch (config.__typename) {
        case 'AWSPrivateLink':
            return {
                provider: 'AWS',
                serviceName: config.serviceName,
                azIds: config.azIds.join(', '),
            };
        case 'AzurePrivateLink':
            return {
                provider: 'AZURE',
                serviceName: config.serviceName,
                resourceType: config.resourceType ?? '',
                dnsName: config.dnsName ?? '',
            };
        case 'GCPPrivateServiceConnect':
            return {
                provider: 'GCP',
                serviceAttachment: config.serviceAttachment,
                dnsZoneName: config.dnsZoneName,
                dnsRecordNames: config.dnsRecordNames.join(', '),
            };
    }
}

interface FormContext {
    // Where the endpoint is created: the data plane's region for a new link,
    // or the link's own region when editing.
    region: string;
    // Services of the other links on the data plane.
    otherServices?: string[];
    // Editing keeps a link's service, so it is not checked: a link made
    // outside this form may name its service in a way the form would not
    // accept for a new one.
    serviceLocked?: boolean;
}

// The service as it is saved for a new link.
function getFormService(form: PrivateLinkForm): string {
    return form.provider === 'GCP'
        ? getGcpServiceAttachmentPath(form.serviceAttachment)
        : form.serviceName.trim();
}

function validateService(
    form: PrivateLinkForm,
    otherServices: string[]
): string | undefined {
    const service = getFormService(form);
    const invalid =
        form.provider === 'AWS'
            ? validateAwsServiceName(service)
            : form.provider === 'AZURE'
              ? validateAzureServiceName(service)
              : validateGcpServiceAttachment(service);

    if (invalid) {
        return invalid;
    }

    return otherServices.some(
        (other) => other.toLowerCase() === service.toLowerCase()
    )
        ? 'This data plane already has a private link to this service.'
        : undefined;
}

export function validateForm(
    form: PrivateLinkForm,
    { region, otherServices = [], serviceLocked = false }: FormContext
): PrivateLinkFormErrors {
    const errors: PrivateLinkFormErrors = {};
    const serviceError = serviceLocked
        ? undefined
        : validateService(form, otherServices);

    switch (form.provider) {
        case 'AWS':
            errors.serviceName = serviceError;
            errors.azIds = validateAwsZoneIds(form.azIds, region);
            break;

        case 'AZURE':
            errors.serviceName = serviceError;

            if (
                !serviceLocked &&
                !serviceError &&
                !isAzurePrivateLinkService(form.serviceName) &&
                !form.resourceType.trim()
            ) {
                errors.resourceType =
                    'Enter the sub-resource to connect to, like sqlServer or blob.';
            } else if (/\s/.test(form.resourceType.trim())) {
                errors.resourceType =
                    'A sub-resource type is a single word, like sqlServer.';
            }

            // Azure private DNS zones need at least two labels.
            if (
                form.dnsName.trim() &&
                !(
                    HOSTNAME.test(form.dnsName.trim()) &&
                    form.dnsName.includes('.')
                )
            ) {
                errors.dnsName =
                    'Enter a hostname like mydb.database.windows.net.';
            }
            break;

        case 'GCP': {
            const records = parseList(form.dnsRecordNames);
            const invalidRecord = records.find(
                (record) => !DNS_RECORD.test(record)
            );

            errors.serviceAttachment = serviceError;

            if (!form.dnsZoneName.trim()) {
                errors.dnsZoneName = 'Enter a DNS zone name.';
            } else if (!HOSTNAME.test(form.dnsZoneName.trim())) {
                errors.dnsZoneName =
                    'Zone names use letters, numbers, hyphens and dots, like acme-links.';
            }

            if (records.length === 0) {
                errors.dnsRecordNames = 'Enter at least one DNS record name.';
            } else if (invalidRecord) {
                errors.dnsRecordNames = `${invalidRecord} is not a DNS record name. Names use letters, numbers and hyphens, like my-database.`;
            }
            break;
        }
    }

    // Drop the fields that passed.
    return Object.fromEntries(
        Object.entries(errors).filter(([_field, error]) => Boolean(error))
    );
}

// Builds the config to save. `region` is where a new link's endpoint is
// created. Editing keeps the service, and everything the form doesn't show,
// from `existing`.
export function getConfigInput(
    form: PrivateLinkForm,
    region: string,
    existing?: PrivateLinkConfig
): PrivateLinkConfigInput {
    const service = getFormService(form);

    switch (form.provider) {
        case 'AWS': {
            const current =
                existing?.__typename === 'AWSPrivateLink' ? existing : null;
            const endpointRegion = current?.region ?? region;

            return {
                aws: {
                    serviceName: current?.serviceName ?? service,
                    region: endpointRegion,
                    serviceRegion: current
                        ? (current.serviceRegion ?? null)
                        : getAwsCrossRegion(service, endpointRegion),
                    azIds: parseList(form.azIds),
                },
            };
        }

        case 'AZURE': {
            const current =
                existing?.__typename === 'AzurePrivateLink' ? existing : null;

            return {
                azure: {
                    serviceName: current?.serviceName ?? service,
                    location: current?.location ?? region,
                    resourceType: form.resourceType.trim() || null,
                    dnsName: form.dnsName.trim() || null,
                },
            };
        }

        case 'GCP': {
            const current =
                existing?.__typename === 'GCPPrivateServiceConnect'
                    ? existing
                    : null;

            return {
                gcp: {
                    serviceAttachment: current?.serviceAttachment ?? service,
                    // A Private Service Connect endpoint is created in its
                    // service attachment's region.
                    region:
                        current?.region ??
                        parseGcpServiceAttachment(service)?.region ??
                        region,
                    dnsZoneName: form.dnsZoneName.trim(),
                    dnsRecordNames: parseList(form.dnsRecordNames),
                    allPorts: current?.allPorts ?? false,
                },
            };
        }
    }
}

// Zones and record names are sets, so their order is not a change.
function getComparableConfig({ aws, azure, gcp }: PrivateLinkConfigInput) {
    return {
        aws: aws && { ...aws, azIds: [...aws.azIds].sort() },
        azure,
        gcp: gcp && {
            ...gcp,
            dnsRecordNames: [...gcp.dnsRecordNames].sort(),
        },
    };
}

// Whether saving `form` would change the link's config. The API sets a link
// up again for any difference, so an edit that changes nothing is not saved.
export function isConfigChanged(
    form: PrivateLinkForm,
    existing: PrivateLinkConfig
): boolean {
    return !isEqual(
        getComparableConfig(getConfigInput(form, '', existing)),
        getComparableConfig(
            getConfigInput(getFormFromConfig(existing), '', existing)
        )
    );
}

// ---------------------------------------------------------------------------
// Provisioning details
//
// `details` is JSON written by the data plane, with a shape per provider. Read
// it defensively: anything unrecognized yields null, and callers fall back to
// showing the JSON as is.

interface AwsDnsName {
    name: string;
    // The zone a name resolves in, like `us-east-1a`. Null for the regional
    // name, which resolves in every zone of the endpoint.
    zone: string | null;
}

export type PrivateLinkEndpoint =
    | { provider: 'AWS'; endpointId: string | null; dnsNames: AwsDnsName[] }
    | { provider: 'AZURE'; ip: string | null; dnsName: string | null }
    | { provider: 'GCP'; ip: string | null; hostnames: string[] };

const AWS_ENDPOINT_ID = /^(vpce-[0-9a-f]+)-/;
const AWS_ZONAL_DNS_NAME =
    /^vpce-[0-9a-f]+-[a-z0-9]+-([a-z]{2}(?:-[a-z]+)+-\d+[a-z])\./;

const asString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null;

const asStrings = (value: unknown): string[] =>
    Array.isArray(value) ? value.flatMap((item) => asString(item) ?? []) : [];

export function getLinkEndpoint(
    config: PrivateLinkConfig,
    details: unknown
): PrivateLinkEndpoint | null {
    if (typeof details !== 'object' || details === null) {
        return null;
    }
    const fields = details as Record<string, unknown>;

    switch (config.__typename) {
        case 'AWSPrivateLink': {
            const names = Array.isArray(fields.dns_entries)
                ? fields.dns_entries.flatMap(
                      (entry) => asString(entry?.dns_name) ?? []
                  )
                : [];
            if (names.length === 0) {
                return null;
            }

            const dnsNames = names.map((name) => ({
                name,
                zone: AWS_ZONAL_DNS_NAME.exec(name)?.[1] ?? null,
            }));

            return {
                provider: 'AWS',
                endpointId: AWS_ENDPOINT_ID.exec(names[0])?.[1] ?? null,
                // Regional names first: they are the ones to connect to.
                dnsNames: [
                    ...dnsNames.filter(({ zone }) => !zone),
                    ...dnsNames.filter(({ zone }) => zone),
                ],
            };
        }

        case 'AzurePrivateLink': {
            const ip = asString(fields.ip);
            // Azure reports the record as a fully-qualified name.
            const dnsName =
                asString(fields.dns_record)?.replace(/\.$/, '') ?? null;

            return ip || dnsName ? { provider: 'AZURE', ip, dnsName } : null;
        }

        case 'GCPPrivateServiceConnect': {
            const ip = asString(fields.ip_address);
            const hostnames = getGcpHostnames(
                asStrings(fields.dns_record_names),
                asString(fields.dns_zone_name) ?? ''
            );

            return ip || hostnames.length > 0
                ? { provider: 'GCP', ip, hostnames }
                : null;
        }
    }
}

// The one address to show for a link in a list: what a task would connect to.
export function getLinkAddress(endpoint: PrivateLinkEndpoint): string | null {
    switch (endpoint.provider) {
        case 'AWS':
            return endpoint.dnsNames[0]?.name ?? null;
        case 'AZURE':
            return endpoint.dnsName ?? endpoint.ip;
        case 'GCP':
            return endpoint.hostnames[0] ?? endpoint.ip;
    }
}
