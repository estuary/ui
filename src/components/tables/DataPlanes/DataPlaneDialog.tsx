import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    getProviderDisplayName,
    getRegionDisplayName,
} from 'src/utils/cloudRegions';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

import {
    DataPlaneDialogField,
    ServiceAccountIdentityField,
} from './DialogFields';

interface DataPlaneDialogProps {
    open: boolean;
    onClose: () => void;
    dataPlane: BaseDataPlaneQuery | null;
}

function DataPlaneDialog({ open, onClose, dataPlane }: DataPlaneDialogProps) {
    const intl = useIntl();
    const theme = useTheme();
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
            aria-labelledby="data-plane-dialog-title"
        >
            {dataPlane && dataPlaneDetails ? (
                <>
                    <DialogTitle id="data-plane-dialog-title">
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                // sx={{ mb: 1 }}
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
                            </Stack>{' '}
                            <IconButton
                                onClick={onClose}
                                size="small"
                                aria-label={intl.formatMessage({
                                    id: 'cta.close',
                                })}
                            >
                                <Xmark
                                    style={{
                                        fontSize: '1rem',
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </IconButton>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            {intl.formatMessage({
                                id: 'admin.dataPlanes.dialog.description',
                            })}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={1}>
                            {dataPlaneDetails.dataPlaneName?.provider ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'admin.dataPlanes.dialog.cloud_provider',
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
                                        id: 'admin.dataPlanes.column.header.region_code',
                                    })}
                                    value={
                                        dataPlaneDetails.dataPlaneName.region
                                    }
                                    showCopyButton={false}
                                />
                            ) : null}

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'admin.dataPlanes.dialog.internal_id',
                                })}
                                value={dataPlane.data_plane_name}
                            />

                            <ServiceAccountIdentityField
                                awsArn={dataPlane.aws_iam_user_arn}
                                gcpEmail={dataPlane.gcp_service_account_email}
                            />

                            {dataPlane.data_plane_fqdn ? (
                                <DataPlaneDialogField
                                    label={intl.formatMessage({
                                        id: 'data.idProvider',
                                    })}
                                    value={`${OPENID_HOST}/${dataPlane.data_plane_fqdn}`}
                                />
                            ) : null}

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.ipv4',
                                })}
                                value={ipv4}
                            />

                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.ipv6',
                                })}
                                value={ipv6}
                            />
                        </Stack>
                    </DialogContent>
                </>
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
