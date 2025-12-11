import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

interface DataPlaneDialogFieldProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
}

function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    return (
        <Stack>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {label}
            </Typography>
            {showCopyButton ? (
                <Stack direction="row" spacing={1}>
                    <TextField
                        value={value || ''}
                        disabled
                        size="small"
                        fullWidth
                        sx={{
                            'flex': 1,
                            '& .MuiInputBase-input': {
                                fontWeight: 500,
                                fontFamily: 'Monospace',
                                fontSize: 12,
                            },
                        }}
                    />
                    <CopyToClipboardButton writeValue={value} />
                </Stack>
            ) : (
                <Typography color="text.secondary">{value || '-'}</Typography>
            )}
        </Stack>
    );
}

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
                <DialogContent>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                    >
                        <DialogTitle id="data-plane-dialog-title" sx={{ p: 0 }}>
                            {dataPlaneDetails.dataPlaneName ? (
                                <DataPlane
                                    dataPlaneName={
                                        dataPlaneDetails.dataPlaneName
                                    }
                                    formattedSuffix={formatDataPlaneName(
                                        dataPlaneDetails.dataPlaneName
                                    )}
                                    hidePrefix
                                    logoSize={30}
                                    scope={dataPlaneDetails.scope}
                                />
                            ) : null}
                        </DialogTitle>

                        <IconButton
                            onClick={onClose}
                            size="small"
                            aria-label={intl.formatMessage({ id: 'cta.close' })}
                        >
                            <Xmark
                                style={{
                                    fontSize: '1rem',
                                    color: theme.palette.text.primary,
                                }}
                            />
                        </IconButton>
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {intl.formatMessage({
                            id: 'data.dataPlaneDetailsDescription',
                        })}
                    </Typography>

                    <Stack spacing={3}>
                        {dataPlaneDetails.dataPlaneName?.provider ? (
                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.cloudProvider',
                                })}
                                value={dataPlaneDetails.dataPlaneName.provider}
                                showCopyButton={false}
                            />
                        ) : null}

                        <DataPlaneDialogField
                            label={intl.formatMessage({ id: 'data.name' })}
                            value={
                                dataPlaneDetails.dataPlaneName
                                    ? formatDataPlaneName(
                                          dataPlaneDetails.dataPlaneName
                                      )
                                    : '-'
                            }
                            showCopyButton={false}
                        />

                        <DataPlaneDialogField
                            label={intl.formatMessage({
                                id: 'data.internalId',
                            })}
                            value={dataPlane.data_plane_name}
                        />

                        {dataPlane.aws_iam_user_arn ? (
                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.awsIamUserArn',
                                })}
                                value={dataPlane.aws_iam_user_arn}
                            />
                        ) : null}

                        {dataPlane.gcp_service_account_email ? (
                            <DataPlaneDialogField
                                label={intl.formatMessage({
                                    id: 'data.gcpServiceAccount',
                                })}
                                value={dataPlane.gcp_service_account_email}
                            />
                        ) : null}

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
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
