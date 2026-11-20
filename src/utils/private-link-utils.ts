import type {
    PrivateLinkConfigInput,
    PrivateLinkFieldsFragment,
} from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { sortBy, uniq } from 'lodash';

import { getRegionDisplayName } from 'src/utils/cloudRegions';

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
export function getPrivateLinkRegion(config: PrivateLinkConfig): string {
    return config.__typename === 'AzurePrivateLink'
        ? config.location
        : config.region;
}

function getPrivateLinkService(config: PrivateLinkConfig): string {
    return config.__typename === 'GCPPrivateServiceConnect'
        ? config.serviceAttachment
        : config.serviceName;
}

export function getPrivateLinkContext(config: PrivateLinkConfig) {
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

export function getPrivateLinkServiceLabel(config: PrivateLinkConfig): string {
    const service = getPrivateLinkService(config);

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
function getAwsCrossRegion({
    region,
    serviceRegion,
}: {
    region: string;
    serviceRegion?: string | null;
}): string | null {
    return serviceRegion && serviceRegion !== region ? serviceRegion : null;
}

export function getCrossRegionDisplayName(config: PrivateLinkConfig) {
    const region =
        config.__typename === 'AWSPrivateLink'
            ? getAwsCrossRegion(config)
            : null;
    return region && getRegionDisplayName('AWS', region);
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

export function getInitialForm(target: CloudProvider | PrivateLinkConfig) {
    const editing = typeof target === 'object';
    const aws =
        editing && target.__typename === 'AWSPrivateLink' ? target : null;
    const azure =
        editing && target.__typename === 'AzurePrivateLink' ? target : null;
    const gcp =
        editing && target.__typename === 'GCPPrivateServiceConnect'
            ? target
            : null;

    return {
        provider: editing ? PRIVATE_LINK_PROVIDERS[target.__typename] : target,
        // GCP uses its service attachment URI for this field.
        serviceName: editing ? getPrivateLinkService(target) : '',
        serviceRegion: aws?.serviceRegion ?? '',
        azIds: aws?.azIds.join(', ') ?? '',
        resourceType: azure?.resourceType ?? '',
        dnsName: azure?.dnsName ?? '',
        dnsZoneName: gcp ? gcp.dnsZoneName : '',
        dnsRecordNames: gcp?.dnsRecordNames.join(', ') ?? '',
    };
}

export type PrivateLinkForm = ReturnType<typeof getInitialForm>;
export type PrivateLinkFormField = Exclude<keyof PrivateLinkForm, 'provider'>;

export type PrivateLinkFormErrors = Partial<
    Record<PrivateLinkFormField, string>
>;

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

interface PrivateLinkEndpoint {
    addresses: EndpointAddress[];
    awsEndpointId?: string;
}

const asString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null;

// Addresses are in connection order, with the preferred address first.
export function getPrivateLinkEndpoint(
    config: PrivateLinkConfig,
    details: unknown
): PrivateLinkEndpoint {
    const addresses: EndpointAddress[] = [];
    if (typeof details !== 'object' || details === null) {
        return { addresses };
    }
    const fields = details as Record<string, unknown>;
    const addAddress = (label: string, value: string | null | undefined) => {
        if (value) {
            addresses.push({ label, value });
        }
    };

    switch (config.__typename) {
        case 'AWSPrivateLink': {
            const regionalLabel = 'Regional DNS name';
            const entries = Array.isArray(fields.dns_entries)
                ? fields.dns_entries
                : [];
            for (const entry of entries) {
                const name = asString(entry?.dns_name);
                if (!name) {
                    continue;
                }
                const zone = AWS_ZONAL_DNS_NAME.exec(name)?.[1];
                addAddress(zone ? `DNS name in ${zone}` : regionalLabel, name);
            }
            const awsEndpointId = AWS_ENDPOINT_ID.exec(
                addresses[0]?.value ?? ''
            )?.[1];
            return {
                // Regional names resolve in every endpoint zone.
                addresses: sortBy(
                    addresses,
                    ({ label }) => label !== regionalLabel
                ),
                awsEndpointId,
            };
        }

        case 'AzurePrivateLink':
            // Azure can include the DNS root's trailing dot.
            addAddress(
                'DNS name',
                asString(fields.dns_record)?.replace(/\.$/, '')
            );
            addAddress('Private IP address', asString(fields.ip));
            return { addresses };

        case 'GCPPrivateServiceConnect': {
            const records = Array.isArray(fields.dns_record_names)
                ? fields.dns_record_names.flatMap(
                      (record) => asString(record) ?? []
                  )
                : [];

            const hostnames = getGcpHostnames(
                records,
                asString(fields.dns_zone_name) ?? ''
            );
            for (const hostname of hostnames) {
                addAddress('DNS name', hostname);
            }
            addAddress('Private IP address', asString(fields.ip_address));
            return { addresses };
        }
    }
}
