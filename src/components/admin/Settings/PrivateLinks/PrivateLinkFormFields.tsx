import type { ReactNode } from 'react';
import type {
    PrivateLinkForm,
    PrivateLinkFormErrors,
    PrivateLinkFormField,
} from 'src/utils/private-link-utils';

import { Stack, TextField } from '@mui/material';

import ExternalLink from 'src/components/shared/ExternalLink';
import { PRIVATE_LINK_DOCS_URL } from 'src/utils/private-link-utils';

interface PrivateLinkFormFieldsProps {
    form: PrivateLinkForm;
    errors: PrivateLinkFormErrors;
    // The endpoint region can differ from the AWS service region.
    region: string;
    // Changing the service would replace the endpoint used by tasks.
    serviceLocked: boolean;
    disabled: boolean;
    onChange: (form: PrivateLinkForm) => void;
}

const AWS_CROSS_REGION_DOCS_URL = `${PRIVATE_LINK_DOCS_URL}#cross-region`;
const AZURE_SUB_RESOURCES_URL =
    'https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview#private-link-resource';

const SERVICE_LOCKED_HELP =
    'To connect to a different service, add another private link.';

export function PrivateLinkFormFields({
    form,
    errors,
    region,
    serviceLocked,
    disabled,
    onChange,
}: PrivateLinkFormFieldsProps) {
    const field = (
        name: PrivateLinkFormField,
        label: string,
        options: { help?: ReactNode; placeholder?: string; multiline?: boolean }
    ) => {
        const locked =
            serviceLocked &&
            (name === 'serviceName' || name === 'serviceRegion');

        return (
            <TextField
                fullWidth
                label={label}
                value={form[name]}
                placeholder={options.placeholder}
                multiline={options.multiline}
                disabled={disabled || locked}
                error={Boolean(errors[name])}
                helperText={
                    errors[name] ??
                    (locked ? SERVICE_LOCKED_HELP : options.help)
                }
                onChange={(event) =>
                    onChange({ ...form, [name]: event.target.value })
                }
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
    };

    if (form.provider === 'AWS') {
        return (
            <Stack spacing={3}>
                {field('serviceName', 'Endpoint service name', {
                    placeholder: `com.amazonaws.vpce.${region}.vpce-svc-0123456789abcdef0`,
                })}

                {field('serviceRegion', 'Service region (optional)', {
                    placeholder: 'us-east-1',
                    help: (
                        <>
                            The service&apos;s region, if different from the
                            data plane&apos;s.{' '}
                            <ExternalLink link={AWS_CROSS_REGION_DOCS_URL}>
                                Cross-region requirements
                            </ExternalLink>
                        </>
                    ),
                })}

                {field('azIds', 'Availability Zone IDs', {
                    placeholder: 'use1-az1, use1-az2',
                    help: 'Separated by commas.',
                })}
            </Stack>
        );
    }

    if (form.provider === 'AZURE') {
        return (
            <Stack spacing={3}>
                {field('serviceName', 'Resource ID', {
                    placeholder:
                        '/subscriptions/…/resourceGroups/…/providers/Microsoft.Network/privateLinkServices/…',
                    multiline: true,
                })}

                {field('resourceType', 'Sub-resource type (optional)', {
                    placeholder: 'sqlServer',
                    help: (
                        <ExternalLink link={AZURE_SUB_RESOURCES_URL}>
                            Sub-resource types
                        </ExternalLink>
                    ),
                })}

                {field('dnsName', 'DNS name (optional)', {
                    placeholder: 'mydb.database.windows.net',
                    help: 'A hostname that resolves to the endpoint inside the data plane.',
                })}
            </Stack>
        );
    }

    return (
        <Stack spacing={3}>
            {field('serviceName', 'Service attachment', {
                placeholder:
                    'projects/my-project/regions/us-central1/serviceAttachments/my-attachment',
                multiline: true,
            })}

            {field('dnsZoneName', 'DNS zone name', {
                placeholder: 'acme-links',
                help: 'A private DNS zone to create inside the data plane.',
            })}

            {field('dnsRecordNames', 'DNS record names', {
                placeholder: 'my-database',
                help: 'Names to create in the zone, separated by commas.',
            })}
        </Stack>
    );
}
