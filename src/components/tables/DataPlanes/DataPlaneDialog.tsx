import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useMemo } from 'react';

import {
    Box,
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

    const selectedSplitCidrBlocks = useMemo(
        () => (selectedRow ? parseCidrBlocks(selectedRow.cidr_blocks) : null),
        [selectedRow, parseCidrBlocks]
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="data-plane-dialog-title"
        >
            {selectedRow &&
            selectedDataPlaneOption &&
            selectedSplitCidrBlocks ? (
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                        }}
                    >
                        <DialogTitle id="data-plane-dialog-title" sx={{ p: 0 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
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
                            </Box>
                        </DialogTitle>

                        <IconButton onClick={onClose} size="small">
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
                        sx={{ mb: 3 }}
                    >
                        {intl.formatMessage({
                            id: 'data.dataPlaneDetailsDescription',
                        })}
                    </Typography>

                    <Stack spacing={3}>
                        {selectedDataPlaneOption.dataPlaneName?.provider ? (
                            <Box>
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
                            </Box>
                        ) : null}

                        <Box>
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
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                gutterBottom
                            >
                                {intl.formatMessage({
                                    id: 'data.internalId',
                                })}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
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
                            </Box>
                        </Box>

                        {selectedRow.aws_iam_user_arn ? (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.awsIamUserArn',
                                    })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                </Box>
                            </Box>
                        ) : null}

                        {selectedRow.gcp_service_account_email ? (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.gcpServiceAccount',
                                    })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                </Box>
                            </Box>
                        ) : null}

                        {selectedRow.data_plane_fqdn ? (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.idProvider',
                                    })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                </Box>
                            </Box>
                        ) : null}

                        {selectedSplitCidrBlocks.ipv4 ? (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.ipv4',
                                    })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        value={selectedSplitCidrBlocks.ipv4}
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
                                            selectedSplitCidrBlocks.ipv4
                                        }
                                    />
                                </Box>
                            </Box>
                        ) : null}

                        {selectedSplitCidrBlocks.ipv6 ? (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    gutterBottom
                                >
                                    {intl.formatMessage({
                                        id: 'data.ipv6',
                                    })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        value={selectedSplitCidrBlocks.ipv6}
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
                                            selectedSplitCidrBlocks.ipv6
                                        }
                                    />
                                </Box>
                            </Box>
                        ) : null}
                    </Stack>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}

export default DataPlaneDialog;
