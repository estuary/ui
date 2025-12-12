import type { DataPlaneDialogProps } from 'src/components/tables/DataPlanes/types';

import { Dialog, DialogContent, Stack, Typography } from '@mui/material';

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
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

const TITLE_ID = 'data-plane-dialog-title';

function DataPlaneDialog({ open, onClose, dataPlane }: DataPlaneDialogProps) {
    const intl = useIntl();
    const parseCidrBlocks = useParseCidrBlocks();

    const dataPlaneDetails = dataPlane
        ? generateDataPlaneOption(dataPlane)
        : null;

    const { ipv4, ipv6 } = parseCidrBlocks(dataPlane?.cidr_blocks);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            {dataPlane && dataPlaneDetails && dataPlaneDetails.dataPlaneName ? (
                <>
                    <DialogTitleWithClose id={TITLE_ID} onClose={onClose}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                        >
                            <DataPlaneIcon
                                provider={
                                    dataPlaneDetails.dataPlaneName.provider
                                }
                                scope={dataPlaneDetails.scope}
                                size={30}
                            />
                            <Typography
                                variant="h6"
                                sx={{ ml: 1, fontWeight: 600 }}
                            >
                                {getRegionDisplayName(
                                    dataPlaneDetails.dataPlaneName.provider,
                                    dataPlaneDetails.dataPlaneName.region
                                )}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            {intl.formatMessage({
                                id: 'admin.dataPlanes.dialog.description',
                            })}
                        </Typography>
                    </DialogTitleWithClose>
                    <DialogContent>
                        <Stack spacing={1}>
                            {dataPlaneDetails.dataPlaneName?.provider ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'admin.dataPlanes.dialog.cloudProvider',
                                    })}
                                    value={getProviderDisplayName(
                                        dataPlaneDetails.dataPlaneName.provider
                                    )}
                                    showCopyButton={false}
                                />
                            ) : null}
                            {dataPlaneDetails.dataPlaneName?.region ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'admin.dataPlanes.column.header.region',
                                    })}
                                    value={
                                        dataPlaneDetails.dataPlaneName.region
                                    }
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
                                        label: 'AWS',
                                        value:
                                            dataPlane.aws_iam_user_arn ??
                                            intl.formatMessage({
                                                id: 'admin.dataPlanes.dialog.notAvailable',
                                            }),
                                    },
                                    {
                                        key: 'gcp',
                                        label: 'GCP',
                                        value:
                                            dataPlane.gcp_service_account_email ??
                                            intl.formatMessage({
                                                id: 'admin.dataPlanes.dialog.notAvailable',
                                            }),
                                    },
                                ]}
                            />
                            <ToggleField
                                label={intl.formatMessage({
                                    id: 'admin.dataPlanes.dialog.ips',
                                })}
                                options={[
                                    {
                                        key: 'ipv4',
                                        label: 'IPv4',
                                        value: ipv4,
                                    },
                                    {
                                        key: 'ipv6',
                                        label: 'IPv6',
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
                </>
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
