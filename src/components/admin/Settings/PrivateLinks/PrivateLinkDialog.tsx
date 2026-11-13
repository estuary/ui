import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type {
    PrivateLink,
    PrivateLinkConfig,
    PrivateLinkEndpoint,
} from 'src/utils/private-link-utils';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
} from '@mui/material';

import { formatDistanceToNow } from 'date-fns';

import { PrivateLinkStatus } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkStatus';
import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import ExternalLink from 'src/components/shared/ExternalLink';
import { DataPlaneDialogField } from 'src/components/tables/DataPlanes/DialogFields/DataPlaneDialogField';
import {
    getLinkEndpoint,
    getLinkProvider,
    getLinkServiceLabel,
    PRIVATE_LINK_LABELS,
    PRIVATE_LINK_PROVIDER_DOCS,
} from 'src/utils/private-link-utils';

const TITLE_ID = 'private-link-dialog-title';

interface PrivateLinkDialogProps {
    dataPlane: PrivateLinkDataPlane;
    link: PrivateLink;
    onClose: () => void;
    onEdit: () => void;
    onRemove: () => void;
}

const sectionTitleSx = { fontSize: 16, fontWeight: 600 };

// What a task connects to, and what the user needs to finish the connection
// on their side.
function Endpoint({ endpoint }: { endpoint: PrivateLinkEndpoint }) {
    switch (endpoint.provider) {
        case 'AWS':
            return (
                <>
                    {endpoint.dnsNames.map(({ name, zone }) => (
                        <DataPlaneDialogField
                            key={name}
                            label={zone ? `DNS name in ${zone}` : 'DNS name'}
                            value={name}
                        />
                    ))}
                    {endpoint.endpointId ? (
                        <DataPlaneDialogField
                            label="Endpoint ID"
                            value={endpoint.endpointId}
                        />
                    ) : null}
                </>
            );

        case 'AZURE':
            return (
                <>
                    {endpoint.dnsName ? (
                        <DataPlaneDialogField
                            label="DNS name"
                            value={endpoint.dnsName}
                        />
                    ) : null}
                    {endpoint.ip ? (
                        <DataPlaneDialogField
                            label="Private IP address"
                            value={endpoint.ip}
                        />
                    ) : null}
                </>
            );

        case 'GCP':
            return (
                <>
                    {endpoint.hostnames.map((hostname) => (
                        <DataPlaneDialogField
                            key={hostname}
                            label="Hostname"
                            value={hostname}
                        />
                    ))}
                    {endpoint.ip ? (
                        <DataPlaneDialogField
                            label="IP address"
                            value={endpoint.ip}
                        />
                    ) : null}
                </>
            );
    }
}

function Configuration({ config }: { config: PrivateLinkConfig }) {
    const plain = (label: string, value: string | null | undefined) =>
        value ? (
            <DataPlaneDialogField
                label={label}
                value={value}
                showCopyButton={false}
            />
        ) : null;

    switch (config.__typename) {
        case 'AWSPrivateLink':
            return (
                <>
                    <DataPlaneDialogField
                        label="Endpoint service name"
                        value={config.serviceName}
                    />
                    {plain(
                        'Region',
                        config.serviceRegion &&
                            config.serviceRegion !== config.region
                            ? `${config.region}, connecting to a service in ${config.serviceRegion}`
                            : config.region
                    )}
                    {plain('Availability Zone IDs', config.azIds.join(', '))}
                </>
            );

        case 'AzurePrivateLink':
            return (
                <>
                    <DataPlaneDialogField
                        label="Resource ID"
                        value={config.serviceName}
                    />
                    {plain('Location', config.location)}
                    {plain('Sub-resource type', config.resourceType)}
                    {plain('DNS name', config.dnsName)}
                </>
            );

        case 'GCPPrivateServiceConnect':
            return (
                <>
                    <DataPlaneDialogField
                        label="Service attachment"
                        value={config.serviceAttachment}
                    />
                    {plain('Region', config.region)}
                    {plain('DNS zone name', config.dnsZoneName)}
                    {plain(
                        'DNS record names',
                        config.dnsRecordNames.join(', ')
                    )}
                </>
            );
    }
}

export function PrivateLinkDialog({
    dataPlane,
    link,
    onClose,
    onEdit,
    onRemove,
}: PrivateLinkDialogProps) {
    const { config, details, error, observedAt, status } = link;
    const provider = getLinkProvider(config);
    const endpoint =
        status === 'PROVISIONED' ? getLinkEndpoint(config, details) : null;

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            <DialogTitleWithClose
                id={TITLE_ID}
                onClose={onClose}
                sx={{ pb: 0 }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', pr: 5 }}
                >
                    <DataPlaneIcon
                        hideScopeIcon
                        provider={provider}
                        scope="private"
                        size={30}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{ fontWeight: 600, minWidth: 0 }}
                    >
                        {getLinkServiceLabel(config)}
                    </Typography>
                    <PrivateLinkStatus status={status} />
                </Stack>
            </DialogTitleWithClose>

            <DialogContent>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 2 }}
                >
                    {PRIVATE_LINK_LABELS[provider]} for {dataPlane.displayName}
                </Typography>

                <Stack spacing={2}>
                    {status === 'PENDING' ? (
                        <AlertBox
                            short
                            severity="info"
                            title="Setting up this link"
                        >
                            The data plane is setting up this link, which can
                            take several minutes. This page updates when it is
                            ready. If it stays pending much longer than that,
                            check the configuration below against the{' '}
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
                            <Typography sx={{ overflowWrap: 'anywhere' }}>
                                {error ?? 'The data plane gave no reason.'}
                            </Typography>
                            {dataPlane.canModify ? (
                                <Typography sx={{ mt: 1 }}>
                                    Edit the link to correct it. If the service
                                    itself is wrong, remove this link and add
                                    one for the right service.
                                </Typography>
                            ) : null}
                        </AlertBox>
                    ) : null}

                    {status === 'PROVISIONED' ? (
                        <Box>
                            <Typography sx={sectionTitleSx}>
                                Connection
                            </Typography>

                            {endpoint ? (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'text.secondary', mb: 1 }}
                                    >
                                        Captures and materializations on this
                                        data plane reach your service through
                                        this endpoint. Before it carries
                                        traffic, its connection request has to
                                        be accepted on your service, unless the
                                        service accepts requests automatically.
                                    </Typography>
                                    <Endpoint endpoint={endpoint} />
                                </>
                            ) : (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        The data plane set up this link without
                                        reporting connection details the
                                        dashboard can read.
                                    </Typography>
                                    {details ? (
                                        <SingleLineCode
                                            value={JSON.stringify(details)}
                                            sx={{ mt: 1 }}
                                        />
                                    ) : null}
                                </>
                            )}
                        </Box>
                    ) : null}

                    <Box>
                        <Typography sx={sectionTitleSx}>
                            Configuration
                        </Typography>
                        <Configuration config={config} />
                    </Box>

                    {observedAt ? (
                        <Typography
                            variant="caption"
                            title={new Date(observedAt).toLocaleString()}
                            sx={{ color: 'text.secondary' }}
                        >
                            Status reported{' '}
                            {formatDistanceToNow(new Date(observedAt), {
                                addSuffix: true,
                            })}
                        </Typography>
                    ) : null}
                </Stack>
            </DialogContent>

            {dataPlane.canModify ? (
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        variant="text"
                        color="error"
                        onClick={onRemove}
                        sx={{ mr: 'auto' }}
                    >
                        Remove
                    </Button>
                    <Button variant="outlined" onClick={onEdit}>
                        Edit
                    </Button>
                </DialogActions>
            ) : null}
        </Dialog>
    );
}
