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

interface DataPlaneDialogProps {
    open: boolean;
    onClose: () => void;
    selectedRow: BaseDataPlaneQuery | null;
}

function DataPlaneDialog({ open, onClose, selectedRow }: DataPlaneDialogProps) {
    const intl = useIntl();
    const theme = useTheme();
    const parseCidrBlocks = useParseCidrBlocks();

    const selectedDataPlaneOption = selectedRow
        ? generateDataPlaneOption(selectedRow)
        : null;

    const { ipv4, ipv6 } = parseCidrBlocks(selectedRow?.cidr_blocks);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="data-plane-dialog-title"
        >
            {selectedRow && selectedDataPlaneOption ? (
                <DialogContent>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                    >
                        <DialogTitle id="data-plane-dialog-title" sx={{ p: 0 }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                {selectedDataPlaneOption.dataPlaneName ? (
                                    <DataPlane
                                        dataPlaneName={
                                            selectedDataPlaneOption.dataPlaneName
                                        }
                                        formattedSuffix={formatDataPlaneName(
                                            selectedDataPlaneOption.dataPlaneName
                                        )}
                                        hidePrefix
                                        logoSize={30}
                                        scope={selectedDataPlaneOption.scope}
                                    />
                                ) : null}
                            </Stack>
                        </DialogTitle>

                        <IconButton onClick={onClose} size="small">
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
                        {selectedDataPlaneOption.dataPlaneName?.provider ? (
                            <Stack>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.cloudProvider',
                                    })}
                                </Typography>
                                <Typography color="text.secondary">
                                    {
                                        selectedDataPlaneOption.dataPlaneName
                                            .provider
                                    }
                                </Typography>
                            </Stack>
                        ) : null}

                        <Stack>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                {intl.formatMessage({ id: 'data.name' })}
                            </Typography>
                            <Typography color="text.secondary">
                                {selectedDataPlaneOption.dataPlaneName
                                    ? formatDataPlaneName(
                                          selectedDataPlaneOption.dataPlaneName
                                      )
                                    : '-'}
                            </Typography>
                        </Stack>

                        <Stack>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                {intl.formatMessage({
                                    id: 'data.internalId',
                                })}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    value={selectedRow.data_plane_name || ''}
                                    disabled
                                    size="small"
                                    fullWidth
                                    sx={{
                                        'flex': 1,
                                        '& .MuiInputBase-input': {
                                            fontWeight: 500,
                                            fontFamily: 'Monospace',
                                        },
                                    }}
                                />
                                <CopyToClipboardButton
                                    writeValue={
                                        selectedRow.data_plane_name || ''
                                    }
                                />
                            </Stack>
                        </Stack>

                        {selectedRow.aws_iam_user_arn ? (
                            <Stack>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.awsIamUserArn',
                                    })}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        value={selectedRow.aws_iam_user_arn}
                                        disabled
                                        size="small"
                                        fullWidth
                                        sx={{
                                            'flex': 1,
                                            '& .MuiInputBase-input': {
                                                fontWeight: 500,
                                                fontFamily: 'Monospace',
                                            },
                                        }}
                                    />
                                    <CopyToClipboardButton
                                        writeValue={
                                            selectedRow.aws_iam_user_arn
                                        }
                                    />
                                </Stack>
                            </Stack>
                        ) : null}

                        {selectedRow.gcp_service_account_email ? (
                            <Stack>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.gcpServiceAccount',
                                    })}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        value={
                                            selectedRow.gcp_service_account_email
                                        }
                                        disabled
                                        size="small"
                                        fullWidth
                                        sx={{
                                            'flex': 1,
                                            '& .MuiInputBase-input': {
                                                fontWeight: 500,
                                                fontFamily: 'Monospace',
                                            },
                                        }}
                                    />
                                    <CopyToClipboardButton
                                        writeValue={
                                            selectedRow.gcp_service_account_email
                                        }
                                    />
                                </Stack>
                            </Stack>
                        ) : null}

                        {selectedRow.data_plane_fqdn ? (
                            <Stack>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {selectedRow.data_plane_fqdn}
                                    {intl.formatMessage({
                                        id: 'data.idProvider',
                                    })}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        value={`${OPENID_HOST}/${selectedRow.data_plane_fqdn}`}
                                        disabled
                                        size="small"
                                        fullWidth
                                        sx={{
                                            'flex': 1,
                                            '& .MuiInputBase-input': {
                                                fontWeight: 500,
                                                fontFamily: 'Monospace',
                                            },
                                        }}
                                    />
                                    <CopyToClipboardButton
                                        writeValue={`${OPENID_HOST}/${selectedRow.data_plane_fqdn}`}
                                    />
                                </Stack>
                            </Stack>
                        ) : null}

                        <Stack>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                {intl.formatMessage({
                                    id: 'data.ipv4',
                                })}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    value={ipv4}
                                    disabled
                                    size="small"
                                    fullWidth
                                    sx={{
                                        'flex': 1,
                                        '& .MuiInputBase-input': {
                                            fontWeight: 500,
                                            fontFamily: 'Monospace',
                                        },
                                    }}
                                />
                                <CopyToClipboardButton writeValue={ipv4} />
                            </Stack>
                        </Stack>

                        <Stack>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                {intl.formatMessage({
                                    id: 'data.ipv6',
                                })}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    value={ipv6}
                                    disabled
                                    size="small"
                                    fullWidth
                                    sx={{
                                        'flex': 1,
                                        '& .MuiInputBase-input': {
                                            fontWeight: 500,
                                            fontFamily: 'Monospace',
                                        },
                                    }}
                                />
                                <CopyToClipboardButton writeValue={ipv6} />
                            </Stack>
                        </Stack>
                    </Stack>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
