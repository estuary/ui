import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { Badge, Dialog, DialogContent, Stack, Typography } from '@mui/material';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { DataPlaneDialogField } from 'src/components/tables/DataPlanes/DialogFields/DataPlaneDialogField';
import { ToggleField } from 'src/components/tables/DataPlanes/DialogFields/ToggleField';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { getRegionDisplayName, PROVIDER_LABELS } from 'src/utils/cloudRegions';
import { formatIamOidc, toPresentableName } from 'src/utils/dataPlane-utils';

const TITLE_ID = 'data-plane-dialog-title';

interface DataPlaneDialogProps {
    onClose: () => void;
    dataPlane: DataPlaneNode;
}

function DataPlaneDialog({ onClose, dataPlane }: DataPlaneDialogProps) {
    const parseCidrBlocks = useParseCidrBlocks();

    const { cloudProvider, region, scope, name, fqdn } = dataPlane;
    const { ipv4, ipv6 } = parseCidrBlocks(dataPlane.cidrBlocks);

    const dataPlaneDisplayName = toPresentableName(dataPlane);
    const regionDisplayName = getRegionDisplayName(cloudProvider, region);
    const iamOidc = fqdn ? formatIamOidc(fqdn) : null;

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
                    alignItems="center"
                    justifyContent="flex-start"
                >
                    <DataPlaneIcon
                        provider={cloudProvider}
                        scope={scope}
                        size={30}
                    />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                        {dataPlaneDisplayName}
                    </Typography>
                    <Badge
                        sx={{
                            ml: 5,
                        }}
                        badgeContent={scope}
                        color="secondary"
                        invisible={scope == 'public'}
                    />
                </Stack>
            </DialogTitleWithClose>
            <DialogContent>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0, mb: 2 }}
                >
                    Data plane details and configuration
                </Typography>
                <Stack spacing={1}>
                    {cloudProvider ? (
                        <DataPlaneDialogField
                            label="Cloud Provider"
                            value={PROVIDER_LABELS[cloudProvider]}
                            showCopyButton={false}
                        />
                    ) : null}
                    {region ? (
                        <DataPlaneDialogField
                            label="Region"
                            value={regionDisplayName}
                            showCopyButton={false}
                        />
                    ) : null}
                    <DataPlaneDialogField label="Internal ID" value={name} />
                    <ToggleField
                        lowercaseButton
                        label="IPs"
                        options={[
                            {
                                key: 'ipv4',
                                label: 'v4',
                                value: ipv4,
                            },
                            {
                                key: 'ipv6',
                                label: 'v6',
                                value: ipv6,
                            },
                        ]}
                    />
                    {iamOidc ? (
                        <DataPlaneDialogField
                            label="IAM OIDC"
                            value={iamOidc}
                        />
                    ) : null}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default DataPlaneDialog;
