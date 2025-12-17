import type { DataPlaneDialogProps } from 'src/components/tables/DataPlanes/types';

import { Badge, Dialog, DialogContent, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import {
    DataPlaneDialogField,
    ToggleField,
} from 'src/components/tables/DataPlanes/DialogFields';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    getProviderDisplayName,
    getProviderShortName,
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

const TITLE_ID = 'data-plane-dialog-title';

function DataPlaneDialog({ onClose, dataPlane }: DataPlaneDialogProps) {
    const intl = useIntl();
    const parseCidrBlocks = useParseCidrBlocks();

    const { dataPlaneName, scope } = generateDataPlaneOption(dataPlane);
    const { ipv4, ipv6 } = parseCidrBlocks(dataPlane.cidr_blocks);

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
                        provider={dataPlaneName.provider}
                        scope={scope}
                        size={30}
                    />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                        {formatDataPlaneName(dataPlaneName)}
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
                    {intl.formatMessage({
                        id: 'admin.dataPlanes.dialog.description',
                    })}
                </Typography>
                <Stack spacing={1}>
                    {dataPlaneName.provider ? (
                        <DataPlaneDialogField
                            label={intl.formatMessage({
                                id: 'admin.dataPlanes.dialog.cloudProvider',
                            })}
                            value={getProviderDisplayName(
                                dataPlaneName.provider
                            )}
                            showCopyButton={false}
                        />
                    ) : null}
                    {dataPlaneName.region ? (
                        <DataPlaneDialogField
                            label={intl.formatMessage({
                                id: 'admin.dataPlanes.column.header.region',
                            })}
                            value={getRegionDisplayName(
                                dataPlaneName.provider,
                                dataPlaneName.region
                            )}
                            showCopyButton={false}
                        />
                    ) : null}
                    <DataPlaneDialogField
                        label={intl.formatMessage({
                            id: 'admin.dataPlanes.dialog.internalId',
                        })}
                        value={dataPlane.data_plane_name}
                    />
                    <ToggleField
                        label={intl.formatMessage({
                            id: 'admin.dataPlanes.dialog.serviceAccountIdentity',
                        })}
                        options={[
                            {
                                key: 'aws',
                                label: getProviderShortName('aws'),
                                value:
                                    dataPlane.aws_iam_user_arn ??
                                    intl.formatMessage({
                                        id: 'admin.dataPlanes.dialog.notAvailable',
                                    }),
                            },
                            {
                                key: 'gcp',
                                label: getProviderShortName('gcp'),
                                value:
                                    dataPlane.gcp_service_account_email ??
                                    intl.formatMessage({
                                        id: 'admin.dataPlanes.dialog.notAvailable',
                                    }),
                            },
                        ]}
                    />
                    <ToggleField
                        lowercaseButton
                        label={intl.formatMessage({
                            id: 'admin.dataPlanes.dialog.ips',
                        })}
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
                    {dataPlane.data_plane_fqdn ? (
                        <DataPlaneDialogField
                            label={intl.formatMessage({
                                id: 'data.idProvider',
                            })}
                            value={`${OPENID_HOST}/${dataPlane.data_plane_fqdn}`}
                        />
                    ) : null}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default DataPlaneDialog;
