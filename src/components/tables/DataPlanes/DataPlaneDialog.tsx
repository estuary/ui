import type { DataPlaneDialogProps } from 'src/components/tables/DataPlanes/types';

import { Badge, Dialog, DialogContent, Stack, Typography } from '@mui/material';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { DataPlaneDialogField } from 'src/components/tables/DataPlanes/DialogFields/DataPlaneDialogField';
import { ToggleField } from 'src/components/tables/DataPlanes/DialogFields/ToggleField';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { getRegionDisplayName, PROVIDER_LABELS } from 'src/utils/cloudRegions';
import { formatIamOidc, toPresentableName } from 'src/utils/dataPlane-utils';

const TITLE_ID = 'data-plane-dialog-title';

function DataPlaneDialog({ onClose, dataPlane }: DataPlaneDialogProps) {
    const parseCidrBlocks = useParseCidrBlocks();

    const { cloudProvider, region, scope, fqdn } = dataPlane;
    const { ipv4, ipv6 } = parseCidrBlocks(dataPlane.cidrBlocks);

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
                        {toPresentableName(dataPlane)}
                    </Typography>
                    <Badge
                        sx={{
                            ml: 5,
                        }}
                        badgeContent={scope}
                        color="secondary"
                        invisible={scope === 'public'}
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
                            value={getRegionDisplayName(cloudProvider, region)}
                            showCopyButton={false}
                        />
                    ) : null}
                    <DataPlaneDialogField
                        label="Internal ID"
                        value={dataPlane.name}
                    />
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
                    {fqdn ? (
                        <DataPlaneDialogField
                            label="IAM OIDC"
                            value={formatIamOidc(fqdn)}
                        />
                    ) : null}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default DataPlaneDialog;
