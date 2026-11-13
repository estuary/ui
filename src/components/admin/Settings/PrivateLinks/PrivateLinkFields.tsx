import type { ReactNode } from 'react';
import type {
    PrivateLinkForm,
    PrivateLinkFormErrors,
    PrivateLinkFormField,
} from 'src/utils/private-link-utils';

import { Stack, TextField } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import {
    AWS_CROSS_REGION_DOCS_URL,
    getAwsCrossRegion,
    getAwsZoneIdPrefix,
    getGcpHostnames,
    isAzurePrivateLinkService,
    parseList,
} from 'src/utils/private-link-utils';

const AZURE_SUB_RESOURCES_URL =
    'https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview#private-link-resource';

interface PrivateLinkFieldsProps {
    form: PrivateLinkForm;
    errors: PrivateLinkFormErrors;
    // Where the endpoint is created.
    region: string;
    // Editing a link keeps its service: a different service is a different
    // endpoint, which would replace the one tasks connect through.
    serviceLocked: boolean;
    disabled: boolean;
    onChange: (form: PrivateLinkForm) => void;
    onBlur: (field: PrivateLinkFormField) => void;
}

const SERVICE_LOCKED_HELP =
    'To connect to a different service, add another private link.';

export function PrivateLinkFields({
    form,
    errors,
    region,
    serviceLocked,
    disabled,
    onChange,
    onBlur,
}: PrivateLinkFieldsProps) {
    const field = (
        name: PrivateLinkFormField,
        label: string,
        value: string,
        update: (value: string) => PrivateLinkForm,
        options: {
            help: ReactNode;
            placeholder?: string;
            locked?: boolean;
            multiline?: boolean;
        }
    ) => (
        <TextField
            fullWidth
            label={label}
            value={value}
            placeholder={options.placeholder}
            multiline={options.multiline}
            disabled={disabled || options.locked}
            error={Boolean(errors[name])}
            helperText={errors[name] ?? options.help}
            onChange={(event) => onChange(update(event.target.value))}
            onBlur={() => onBlur(name)}
            slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                    autoCapitalize: 'off',
                    autoCorrect: 'off',
                    spellCheck: false,
                    sx: { fontFamily: 'monospace', fontSize: 13 },
                },
            }}
        />
    );

    if (form.provider === 'AWS') {
        const crossRegion = getAwsCrossRegion(form.serviceName, region);
        const zonePrefix = getAwsZoneIdPrefix(region) ?? 'use1';

        return (
            <Stack spacing={3}>
                {field(
                    'serviceName',
                    'Endpoint service name',
                    form.serviceName,
                    (serviceName) => ({ ...form, serviceName }),
                    {
                        placeholder: `com.amazonaws.vpce.${region}.vpce-svc-0123456789abcdef0`,
                        locked: serviceLocked,
                        help: serviceLocked
                            ? SERVICE_LOCKED_HELP
                            : 'The service name of your VPC endpoint service, from its Details tab in the AWS console.',
                    }
                )}

                {crossRegion ? (
                    <AlertBox short severity="info" title="Cross-region link">
                        This service is in {crossRegion} and the data plane is
                        in {region}. Your endpoint service must list {region} as
                        a supported region.{' '}
                        <ExternalLink link={AWS_CROSS_REGION_DOCS_URL}>
                            Cross-region requirements
                        </ExternalLink>
                    </AlertBox>
                ) : null}

                {field(
                    'azIds',
                    'Availability Zone IDs',
                    form.azIds,
                    (azIds) => ({ ...form, azIds }),
                    {
                        placeholder: `${zonePrefix}-az1, ${zonePrefix}-az2`,
                        help: crossRegion
                            ? `Zone IDs in ${region} to create the endpoint in, separated by commas. The zones of your service in ${crossRegion} don't apply.`
                            : `The zone IDs your endpoint service is available in, separated by commas. These are IDs like ${zonePrefix}-az1, not names like ${region}a.`,
                    }
                )}
            </Stack>
        );
    }

    if (form.provider === 'AZURE') {
        // A Private Link service takes no sub-resource, so the field only
        // shows for other resources, or to edit a value a link already has.
        const showResourceType =
            Boolean(form.resourceType) ||
            (Boolean(form.serviceName.trim()) &&
                !isAzurePrivateLinkService(form.serviceName));

        return (
            <Stack spacing={3}>
                {field(
                    'serviceName',
                    'Resource ID',
                    form.serviceName,
                    (serviceName) => ({ ...form, serviceName }),
                    {
                        placeholder:
                            '/subscriptions/…/resourceGroups/…/providers/Microsoft.Network/privateLinkServices/…',
                        locked: serviceLocked,
                        multiline: true,
                        help: serviceLocked
                            ? SERVICE_LOCKED_HELP
                            : 'The resource ID of your Private Link service, or of an Azure resource that supports Private Link, such as a SQL server or a storage account.',
                    }
                )}

                {showResourceType
                    ? field(
                          'resourceType',
                          'Sub-resource type',
                          form.resourceType,
                          (resourceType) => ({ ...form, resourceType }),
                          {
                              placeholder: 'sqlServer',
                              help: (
                                  <>
                                      The part of the resource to connect to,
                                      such as sqlServer for Azure SQL Database
                                      or blob for Blob Storage.{' '}
                                      <ExternalLink
                                          link={AZURE_SUB_RESOURCES_URL}
                                      >
                                          Sub-resource types
                                      </ExternalLink>
                                  </>
                              ),
                          }
                      )
                    : null}

                {field(
                    'dnsName',
                    'DNS name (optional)',
                    form.dnsName,
                    (dnsName) => ({ ...form, dnsName }),
                    {
                        placeholder: 'mydb.database.windows.net',
                        help: 'A hostname to resolve to the private endpoint inside the data plane. Leave empty to connect by IP address.',
                    }
                )}
            </Stack>
        );
    }

    const hostnames = getGcpHostnames(
        parseList(form.dnsRecordNames),
        form.dnsZoneName
    );

    return (
        <Stack spacing={3}>
            {field(
                'serviceAttachment',
                'Service attachment',
                form.serviceAttachment,
                (serviceAttachment) => ({ ...form, serviceAttachment }),
                {
                    placeholder:
                        'projects/my-project/regions/us-central1/serviceAttachments/my-attachment',
                    locked: serviceLocked,
                    multiline: true,
                    help: serviceLocked
                        ? SERVICE_LOCKED_HELP
                        : 'The URI of the service attachment of your published service. A Cloud SQL instance shows it under Connect to this instance.',
                }
            )}

            {field(
                'dnsZoneName',
                'DNS zone name',
                form.dnsZoneName,
                (dnsZoneName) => ({ ...form, dnsZoneName }),
                {
                    placeholder: 'acme-links',
                    help: 'A private DNS zone to create inside the data plane.',
                }
            )}

            {field(
                'dnsRecordNames',
                'DNS record names',
                form.dnsRecordNames,
                (dnsRecordNames) => ({ ...form, dnsRecordNames }),
                {
                    placeholder: 'my-database',
                    help:
                        hostnames.length > 0 &&
                        !errors.dnsZoneName &&
                        !errors.dnsRecordNames
                            ? `Tasks connect to ${hostnames.join(', ')}.`
                            : 'Names to create in the zone, separated by commas. Each one resolves to the endpoint.',
                }
            )}
        </Stack>
    );
}
