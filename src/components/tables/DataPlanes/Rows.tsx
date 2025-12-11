import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { useMemo, useState } from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TableCell,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { InfoCircle, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'src/context/Theme';
import useParseCidrBlocks from 'src/hooks/useParseCidrBlocks';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';
import { OPENID_HOST } from 'src/utils/misc-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
    rowSx: any;
    onRowClick: (row: BaseDataPlaneQuery) => void;
}

function Row({ row, rowSx, onRowClick }: RowProps) {
    const dataPlaneOption = generateDataPlaneOption(row);
    const parseCidrBlocks = useParseCidrBlocks();

    const splitCidrBlocks = useMemo(
        () => parseCidrBlocks(row.cidr_blocks),
        [row.cidr_blocks, parseCidrBlocks]
    );

    return (
        <TableRow
            hover
            sx={{
                ...rowSx,
                'cursor': 'pointer',
                '& .info-icon': {
                    opacity: 0,
                    transition: 'opacity 0.15s ease-in-out',
                },
                '&:hover .info-icon': {
                    opacity: 1,
                },
            }}
            onClick={() => onRowClick(row)}
        >
            <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <InfoCircle className="info-icon" fontSize={12} />

                    {Boolean(dataPlaneOption.dataPlaneName) ? (
                        <DataPlane
                            dataPlaneName={dataPlaneOption.dataPlaneName}
                            formattedSuffix={formatDataPlaneName(
                                dataPlaneOption.dataPlaneName
                            )}
                            hidePrefix
                            logoSize={30}
                            scope={dataPlaneOption.scope}
                        />
                    ) : null}
                </Stack>
            </TableCell>
            <TableCell>
                <TechnicalEmphasis>{splitCidrBlocks.ipv4}</TechnicalEmphasis>
            </TableCell>
            <TableCell>
                <TechnicalEmphasis>{splitCidrBlocks.ipv6}</TechnicalEmphasis>
            </TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const intl = useIntl();
    const theme = useTheme();
    const parseCidrBlocks = useParseCidrBlocks();

    const [selectedRow, setSelectedRow] = useState<BaseDataPlaneQuery | null>(
        null
    );

    const handleRowClick = (row: BaseDataPlaneQuery) => {
        setSelectedRow(row);
    };

    const handleCloseModal = () => {
        setSelectedRow(null);
    };

    const selectedDataPlaneOption = selectedRow
        ? generateDataPlaneOption(selectedRow)
        : null;

    const selectedSplitCidrBlocks = useMemo(
        () => (selectedRow ? parseCidrBlocks(selectedRow.cidr_blocks) : null),
        [selectedRow, parseCidrBlocks]
    );

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.id}
                    row={row}
                    rowSx={getEntityTableRowSx(theme)}
                    onRowClick={handleRowClick}
                />
            ))}

            <Dialog
                open={Boolean(selectedRow)}
                onClose={handleCloseModal}
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
                            <DialogTitle
                                id="data-plane-dialog-title"
                                sx={{ p: 0 }}
                            >
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
                                            scope={
                                                selectedDataPlaneOption.scope
                                            }
                                        />
                                    ) : null}
                                </Box>
                            </DialogTitle>

                            <IconButton onClick={handleCloseModal} size="small">
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
                            Data plane details and configuration
                        </Typography>

                        <Stack spacing={3}>
                            {selectedDataPlaneOption.dataPlaneName?.provider ? (
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={600}
                                        gutterBottom
                                    >
                                        Cloud Provider
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {
                                            selectedDataPlaneOption
                                                .dataPlaneName.provider
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
                                    Internal ID
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        value={
                                            selectedRow.data_plane_name || ''
                                        }
                                        disabled
                                        size="small"
                                        fullWidth
                                        sx={{ flex: 1 }}
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
                                        IAM User ARN
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            value={selectedRow.aws_iam_user_arn}
                                            disabled
                                            size="small"
                                            fullWidth
                                            sx={{ flex: 1 }}
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
                                            sx={{ flex: 1 }}
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
                                            sx={{ flex: 1 }}
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
                                            sx={{ flex: 1 }}
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
                                            sx={{ flex: 1 }}
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
        </>
    );
}

export default Rows;
