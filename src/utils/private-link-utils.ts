import type {
    PrivateLinkConfigInput,
    PrivateLinkFieldsFragment,
} from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { sortBy, uniq } from 'lodash';

export type PrivateLink = PrivateLinkFieldsFragment;
export type PrivateLinkConfig = PrivateLink['config'];

export const PRIVATE_LINK_DOCS_URL =
    'https://docs.estuary.dev/private-byoc/privatelink/';

export const PRIVATE_LINK_PROVIDER_DOCS: Record<CloudProvider, string> = {
    AWS: `${PRIVATE_LINK_DOCS_URL}#aws-privatelink`,
    AZURE: `${PRIVATE_LINK_DOCS_URL}#azure-private-link`,
    GCP: `${PRIVATE_LINK_DOCS_URL}#gcp-private-service-connect`,
};

export const PRIVATE_LINK_PROVIDERS: Record<
    PrivateLinkConfig['__typename'],
    CloudProvider
> = {
    AWSPrivateLink: 'AWS',
    AzurePrivateLink: 'AZURE',
    GCPPrivateServiceConnect: 'GCP',
};

// Use the endpoint's region even for a cross-region service.
export function getLinkRegion(config: PrivateLinkConfig): string {
    return config.__typename === 'AzurePrivateLink'
        ? config.location
        : config.region;
}

function getLinkService(config: PrivateLinkConfig): string {
    return config.__typename === 'GCPPrivateServiceConnect'
        ? config.serviceAttachment
        : config.serviceName;
}

export function getLinkContext(config: PrivateLinkConfig) {
    switch (config.__typename) {
        case 'AWSPrivateLink':
            return {
                label: 'Availability Zone IDs',
                value: config.azIds.join(', '),
            };
        case 'AzurePrivateLink':
            return {
                label: 'Resource group',
                value: /\/resourceGroups\/([^/]+)/i.exec(
                    config.serviceName
                )?.[1],
            };
        case 'GCPPrivateServiceConnect':
            return {
                label: 'Project',
                value: /(?:^|\/)projects\/([^/]+)/.exec(
                    config.serviceAttachment
                )?.[1],
            };
    }
}

export function getLinkServiceLabel(config: PrivateLinkConfig): string {
    const service = getLinkService(config);

    if (config.__typename === 'AWSPrivateLink') {
        const last = service.split('.').pop();
        return last?.startsWith('vpce-svc-') ? last : service;
    }

    return service.split('/').filter(Boolean).pop() ?? service;
}

export function proposeAwsServiceRegion(
    serviceName: string,
    region: string
): string {
    const serviceRegion = /\.vpce\.([^.]+)\.vpce-svc-/.exec(serviceName)?.[1];
    return getAwsCrossRegion({ region, serviceRegion }) ?? '';
}

// A same-region service has no separate region to display.
export function getAwsCrossRegion({
    region,
    serviceRegion,
}: {
    region: string;
    serviceRegion?: string | null;
}): string | null {
    return serviceRegion && serviceRegion !== region ? serviceRegion : null;
}

// Tasks resolve these names inside the data plane.
function getGcpHostnames(
    dnsRecordNames: string[],
    dnsZoneName: string
): string[] {
    const zone = dnsZoneName.trim();
    return zone ? dnsRecordNames.map((record) => `${record}.${zone}`) : [];
}

// Accept pasted lists with brackets or quotes and return each entry once.
export function parseList(text: string): string[] {
    return uniq(text.split(/[\s,;[\]"'`]+/).filter(Boolean));
}

export interface PrivateLinkForm {
    provider: CloudProvider;
    // GCP uses its service attachment URI for this field.
    serviceName: string;
    serviceRegion: string;
    azIds: string;
    resourceType: string;
    dnsName: string;
    dnsZoneName: string;
    dnsRecordNames: string;
}

export type PrivateLinkFormField = Exclude<keyof PrivateLinkForm, 'provider'>;

export type PrivateLinkFormErrors = Partial<
    Record<PrivateLinkFormField, string>
>;

export function getEmptyForm(provider: CloudProvider): PrivateLinkForm {
    return {
        provider,
        serviceName: '',
        serviceRegion: '',
        azIds: '',
        resourceType: '',
        dnsName: '',
        dnsZoneName: '',
        dnsRecordNames: '',
    };
}

export function getFormFromConfig(config: PrivateLinkConfig): PrivateLinkForm {
    const form = {
        ...getEmptyForm(PRIVATE_LINK_PROVIDERS[config.__typename]),
        serviceName: getLinkService(config),
    };

    switch (config.__typename) {
        case 'AWSPrivateLink':
            return {
                ...form,
                serviceRegion: config.serviceRegion ?? '',
                azIds: config.azIds.join(', '),
            };
        case 'AzurePrivateLink':
            return {
                ...form,
                resourceType: config.resourceType ?? '',
                dnsName: config.dnsName ?? '',
            };
        case 'GCPPrivateServiceConnect':
            return {
                ...form,
                dnsZoneName: config.dnsZoneName,
                dnsRecordNames: config.dnsRecordNames.join(', '),
            };
    }
}

export function validateForm(form: PrivateLinkForm): PrivateLinkFormErrors {
    const errors: PrivateLinkFormErrors = {};

    if (!form.serviceName.trim()) {
        errors.serviceName = {
            AWS: 'Enter the endpoint service name.',
            AZURE:
                'Enter the resource ID of the Private Link service ' +
                'or Azure resource.',
            GCP: 'Enter the service attachment URI.',
        }[form.provider];
    }

    if (form.provider === 'AWS' && parseList(form.azIds).length === 0) {
        errors.azIds = 'Enter at least one Availability Zone ID.';
    }

    if (form.provider === 'GCP') {
        if (!form.dnsZoneName.trim()) {
            errors.dnsZoneName = 'Enter a DNS zone name.';
        }
        if (parseList(form.dnsRecordNames).length === 0) {
            errors.dnsRecordNames = 'Enter at least one DNS record name.';
        }
    }

    return errors;
}

// `region` is the data plane's region for a new link. Edits preserve
// locked fields and settings the form doesn't show.
export function getConfigInput(
    form: PrivateLinkForm,
    region: string,
    existing?: PrivateLinkConfig
): PrivateLinkConfigInput {
    const service = form.serviceName.trim();

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
                        : getAwsCrossRegion({
                              region: endpointRegion,
                              serviceRegion: form.serviceRegion.trim(),
                          }),
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
                        /\/regions\/([^/]+)\/serviceAttachments\//.exec(
                            service
                        )?.[1] ??
                        region,
                    dnsZoneName: form.dnsZoneName.trim(),
                    dnsRecordNames: parseList(form.dnsRecordNames),
                    allPorts: current?.allPorts ?? false,
                },
            };
        }
    }
}

const AWS_ENDPOINT_ID = /^(vpce-[0-9a-f]+)-/;
const AWS_ZONAL_DNS_NAME =
    /^vpce-[0-9a-f]+-[a-z0-9]+-([a-z]{2}(?:-[a-z]+)+-\d+[a-z])\./;

interface EndpointAddress {
    label: string;
    value: string;
}

interface LinkEndpoint {
    addresses: EndpointAddress[];
    awsEndpointId?: string;
}

const asString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null;

const addressIfPresent = (
    label: string,
    value: string | null | undefined
): EndpointAddress[] => (value ? [{ label, value }] : []);

// Addresses are in connection order, with the preferred address first.
export function getLinkEndpoint(
    config: PrivateLinkConfig,
    details: unknown
): LinkEndpoint {
    if (typeof details !== 'object' || details === null) {
        return { addresses: [] };
    }
    const fields = details as Record<string, unknown>;

    switch (config.__typename) {
        case 'AWSPrivateLink': {
            const names = Array.isArray(fields.dns_entries)
                ? fields.dns_entries.flatMap(
                      (entry) => asString(entry?.dns_name) ?? []
                  )
                : [];
            const dnsNames = sortBy(
                names.map((name) => ({
                    name,
                    zone: AWS_ZONAL_DNS_NAME.exec(name)?.[1],
                })),
                // Regional names resolve in every endpoint zone.
                ({ zone }) => (zone ? 1 : 0)
            );

            return {
                addresses: dnsNames.map(({ name, zone }) => ({
                    label: zone ? `DNS name in ${zone}` : 'Regional DNS name',
                    value: name,
                })),
                awsEndpointId: names[0]
                    ? AWS_ENDPOINT_ID.exec(names[0])?.[1]
                    : undefined,
            };
        }

        case 'AzurePrivateLink':
            return {
                addresses: [
                    // Azure can include the DNS root's trailing dot.
                    ...addressIfPresent(
                        'DNS name',
                        asString(fields.dns_record)?.replace(/\.$/, '')
                    ),
                    ...addressIfPresent(
                        'Private IP address',
                        asString(fields.ip)
                    ),
                ],
            };

        case 'GCPPrivateServiceConnect': {
            const records = Array.isArray(fields.dns_record_names)
                ? fields.dns_record_names.flatMap(
                      (record) => asString(record) ?? []
                  )
                : [];

            return {
                addresses: [
                    ...getGcpHostnames(
                        records,
                        asString(fields.dns_zone_name) ?? ''
                    ).map((value) => ({ label: 'DNS name', value })),
                    ...addressIfPresent(
                        'Private IP address',
                        asString(fields.ip_address)
                    ),
                ],
            };
        }
    }
}
