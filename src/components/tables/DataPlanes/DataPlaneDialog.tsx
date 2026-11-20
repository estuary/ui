import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { DataPlaneCloudProvider } from 'src/gql-types/graphql';

import { Dialog, DialogContent, Stack, Typography } from '@mui/material';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import {
    LabeledValue,
    LabeledValueGroup,
} from 'src/components/shared/LabeledValue';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import { getRegionDisplayName, PROVIDER_LABELS } from 'src/utils/cloudRegions';
import { formatIamOidc, toPresentableName } from 'src/utils/dataPlane-utils';

const TITLE_ID = 'data-plane-dialog-title';

interface DataPlaneDialogProps {
    onClose: () => void;
    dataPlane: Pick<
        DataPlaneNode,
        'cidrBlocks' | 'fqdn' | 'name' | 'region' | 'scope'
    > & { cloudProvider: DataPlaneCloudProvider };
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
            <DialogTitleWithClose id={TITLE_ID} onClose={onClose}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', pr: 3 }}
                >
                    <DataPlaneIcon
                        hideScopeIcon
                        provider={cloudProvider}
                        scope={scope}
                    />
                    <Typography component="span" variant="h6">
                        {dataPlaneDisplayName}
                    </Typography>
                </Stack>
            </DialogTitleWithClose>
            <DialogContent>
                <Stack spacing={2}>
                    <LabeledValueGroup title="Egress IP ranges">
                        <LabeledValue label="IPv4" value={ipv4} />
                        <LabeledValue
                            label="IPv6"
                            value={ipv6}
                            showCopyButton={dataPlane.cidrBlocks.length > 0}
                        />
                    </LabeledValueGroup>
                    <LabeledValueGroup title="Data plane identity">
                        <LabeledValue
                            label="Cloud provider"
                            value={
                                cloudProvider === 'LOCAL'
                                    ? 'Local'
                                    : PROVIDER_LABELS[cloudProvider]
                            }
                            showCopyButton={false}
                        />
                        {region ? (
                            <LabeledValue
                                label="Region"
                                value={regionDisplayName}
                                showCopyButton={false}
                            />
                        ) : null}
                        <LabeledValue label="Internal ID" value={name} />
                        {iamOidc ? (
                            <LabeledValue
                                label="IAM OIDC issuer"
                                value={iamOidc}
                            />
                        ) : null}
                    </LabeledValueGroup>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default DataPlaneDialog;
