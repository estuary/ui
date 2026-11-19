import type {
    PrivateLink,
    PrivateLinkConfig,
} from 'src/utils/private-link-utils';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
} from '@mui/material';

import { PrivateLinkStatus } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkStatus';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import ExternalLink from 'src/components/shared/ExternalLink';
import {
    LabeledValue,
    LabeledValueGroup,
} from 'src/components/shared/LabeledValue';
import { getRegionDisplayName } from 'src/utils/cloudRegions';
import {
    getAwsCrossRegion,
    getLinkContext,
    getLinkEndpoint,
    getLinkRegion,
    getLinkServiceLabel,
    PRIVATE_LINK_PROVIDER_DOCS,
    PRIVATE_LINK_PROVIDERS,
} from 'src/utils/private-link-utils';

const TITLE_ID = 'private-link-dialog-title';

interface PrivateLinkDialogProps {
    planeDisplayName: string;
    link: PrivateLink;
    canModify: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function PrivateLinkDialog({
    planeDisplayName,
    link,
    canModify,
    onClose,
    onEdit,
    onDelete,
}: PrivateLinkDialogProps) {
    const { config, details, error, status } = link;
    const provider = PRIVATE_LINK_PROVIDERS[config.__typename];
    const { addresses, awsEndpointId } = getLinkEndpoint(config, details);
    const host =
        provider === 'AWS' ? 'the regional DNS name' : 'a listed address';

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            <DialogTitleWithClose id={TITLE_ID} onClose={onClose}>
                <Stack spacing={0.5} sx={{ pr: 3 }}>
                    <Typography
                        variant="h6"
                        component="span"
                        sx={{ overflowWrap: 'anywhere' }}
                    >
                        {getLinkServiceLabel(config)}
                    </Typography>
                    <Stack
                        direction="row"
                        useFlexGap
                        spacing={1}
                        sx={{ flexWrap: 'wrap', alignItems: 'center' }}
                    >
                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: 'center' }}
                        >
                            <DataPlaneIcon
                                hideScopeIcon
                                provider={provider}
                                scope="private"
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {planeDisplayName}
                            </Typography>
                        </Stack>
                        <PrivateLinkStatus status={status} />
                    </Stack>
                </Stack>
            </DialogTitleWithClose>

            <DialogContent dividers>
                <Stack spacing={2}>
                    {status === 'PENDING' ? (
                        <AlertBox
                            short
                            severity="info"
                            title="Setting up this link"
                        >
                            The endpoint address will appear here when the data
                            plane reports it. If setup takes longer than
                            expected, check the{' '}
                            <ExternalLink
                                link={PRIVATE_LINK_PROVIDER_DOCS[provider]}
                            >
                                setup guide
                            </ExternalLink>{' '}
                            or contact support.
                        </AlertBox>
                    ) : null}

                    {status === 'FAILED' ? (
                        <AlertBox
                            short
                            severity="error"
                            title="This link couldn't be set up"
                        >
                            {error ? (
                                <Typography sx={{ overflowWrap: 'anywhere' }}>
                                    {error}
                                </Typography>
                            ) : null}
                        </AlertBox>
                    ) : null}

                    <LabeledValueGroup title="Configuration">
                        {getConfiguration(config).map(
                            ({ label, value, copy }) =>
                                value ? (
                                    <LabeledValue
                                        key={label}
                                        label={label}
                                        value={value}
                                        showCopyButton={copy ?? false}
                                    />
                                ) : null
                        )}
                    </LabeledValueGroup>

                    {status === 'PROVISIONED' ? (
                        addresses.length > 0 ? (
                            <Stack spacing={0.75}>
                                <LabeledValueGroup title="Endpoint details">
                                    {addresses.map(({ label, value }) => (
                                        <LabeledValue
                                            key={`${label} ${value}`}
                                            label={label}
                                            value={value}
                                        />
                                    ))}
                                    {awsEndpointId ? (
                                        <LabeledValue
                                            label="Endpoint ID"
                                            value={awsEndpointId}
                                            hint="If your service requires manual approval, match this ID to Estuary’s request under Endpoint connections in AWS."
                                        />
                                    ) : null}
                                </LabeledValueGroup>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Use {host} as the host in a capture or
                                    materialization on this data plane.
                                </Typography>
                            </Stack>
                        ) : (
                            <Stack spacing={0.75}>
                                {details ? (
                                    <LabeledValueGroup title="Endpoint details">
                                        <LabeledValue
                                            label="Reported details"
                                            value={JSON.stringify(details)}
                                        />
                                    </LabeledValueGroup>
                                ) : null}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    The data plane provisioned this link without
                                    reporting a usable address.
                                </Typography>
                            </Stack>
                        )
                    ) : null}
                </Stack>
            </DialogContent>

            {canModify ? (
                <DialogActions sx={{ px: 3 }}>
                    <Button
                        variant="text"
                        color="error"
                        onClick={onDelete}
                        sx={{ mr: 'auto' }}
                    >
                        Delete
                    </Button>
                    <Button variant="outlined" onClick={onEdit}>
                        Edit
                    </Button>
                </DialogActions>
            ) : null}
        </Dialog>
    );
}

function getConfiguration(config: PrivateLinkConfig): {
    label: string;
    value: string | null | undefined;
    copy?: boolean;
}[] {
    const provider = PRIVATE_LINK_PROVIDERS[config.__typename];
    const region = getRegionDisplayName(provider, getLinkRegion(config));

    switch (config.__typename) {
        case 'AWSPrivateLink': {
            const serviceRegion = getAwsCrossRegion(config);

            return [
                {
                    label: 'Endpoint service name',
                    value: config.serviceName,
                    copy: true,
                },
                { label: 'Endpoint region', value: region },
                {
                    label: 'Service region',
                    value:
                        serviceRegion &&
                        getRegionDisplayName(provider, serviceRegion),
                },
                getLinkContext(config),
            ];
        }

        case 'AzurePrivateLink':
            return [
                { label: 'Resource ID', value: config.serviceName, copy: true },
                getLinkContext(config),
                { label: 'Location', value: region },
                { label: 'Sub-resource type', value: config.resourceType },
                { label: 'DNS name', value: config.dnsName },
            ];

        case 'GCPPrivateServiceConnect':
            return [
                {
                    label: 'Service attachment',
                    value: config.serviceAttachment,
                    copy: true,
                },
                getLinkContext(config),
                { label: 'Endpoint region', value: region },
                { label: 'DNS zone name', value: config.dnsZoneName },
                {
                    label: 'DNS record names',
                    value: config.dnsRecordNames.join(', '),
                },
            ];
    }
}
