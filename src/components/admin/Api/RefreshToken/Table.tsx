import type { RefreshTokenInfo } from 'src/gql-types/graphql';

import { useState } from 'react';

import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { useRefreshTokens } from 'src/api/gql/refreshTokens';
import { CreateRefreshTokenDialog } from 'src/components/admin/Api/RefreshToken/CreateDialog';
import { RevokeDialog } from 'src/components/admin/Api/RefreshToken/RevokeDialog';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

interface RowProps {
    row: Pick<
        RefreshTokenInfo,
        'id' | 'detail' | 'createdAt' | 'uses' | 'expired'
    >;
    onRevoked?: () => void;
}

function Row({ row, onRevoked }: RowProps) {
    const intl = useIntl();

    const [revokeOpen, setRevokeOpen] = useState(false);

    return (
        <TableRow>
            <TimeStamp
                time={row.createdAt}
                TableCellProps={
                    row.expired ? { sx: { opacity: 0.5 } } : undefined
                }
            />

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                <Typography sx={{ textWrap: 'wrap' }}>{row.detail}</Typography>
            </TableCell>

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                {intl.formatMessage(
                    { id: 'admin.cli_api.refreshToken.table.label.uses' },
                    { count: row.uses }
                )}
            </TableCell>

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                {row.expired ? (
                    <Typography>
                        <FormattedMessage id="admin.cli_api.refreshToken.table.status.expired" />
                    </Typography>
                ) : null}
            </TableCell>

            <TableCell>
                <Button
                    color="error"
                    onClick={() => setRevokeOpen(true)}
                    variant="text"
                >
                    <FormattedMessage id="cta.remove" />
                </Button>

                <RevokeDialog
                    open={revokeOpen}
                    onClose={() => setRevokeOpen(false)}
                    onRevoked={onRevoked}
                    id={row.id}
                    detail={row.detail}
                />
            </TableCell>
        </TableRow>
    );
}

export function RefreshTokenTable() {
    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const { refreshTokens, fetching, error, pageInfo, pageSize } =
        useRefreshTokens(cursor);

    const [dialogOpen, setDialogOpen] = useState(false);

    const handlePageChange = (_event: any, page: number) => {
        onPageChange(_event, page, pageInfo?.endCursor);
    };

    return (
        <Box sx={{ mx: 2 }}>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Button onClick={() => setDialogOpen(true)} variant="outlined">
                    <FormattedMessage id="admin.cli_api.refreshToken.cta.create" />
                </Button>

                <CreateRefreshTokenDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onCreated={() => goToPage(0)}
                />
            </Box>

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.cli_api.refreshToken.table.error" />
                </Typography>
            ) : null}

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormattedMessage id="entityTable.data.created" />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage id="admin.cli_api.refreshToken.table.column.label" />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage id="entityTable.data.status" />
                            </TableCell>
                            <TableCell sx={{ width: 100 }} />
                            <TableCell sx={{ width: 125 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fetching && refreshTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : refreshTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        <FormattedMessage id="admin.cli_api.refreshToken.table.noContent.header" />
                                    </Typography>
                                    <Typography
                                        component="a"
                                        variant="body2"
                                        color="primary"
                                        onClick={() => setDialogOpen(true)}
                                        sx={{
                                            'cursor': 'pointer',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        <FormattedMessage id="admin.cli_api.refreshToken.table.noContent.cta" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            refreshTokens.map((row) => (
                                <Row
                                    key={row.id}
                                    row={row}
                                    onRevoked={
                                        currentPage > 0 &&
                                        refreshTokens.length === 1
                                            ? () => goToPage(currentPage - 1)
                                            : undefined
                                    }
                                />
                            ))
                        )}
                    </TableBody>

                    {pageInfo && refreshTokens.length > 0 ? (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={-1}
                                    page={currentPage}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={[pageSize]}
                                    onPageChange={handlePageChange}
                                    labelDisplayedRows={({ from }) => {
                                        const to =
                                            from + refreshTokens.length - 1;
                                        return `${from}–${to}`;
                                    }}
                                    slotProps={{
                                        actions: {
                                            previousButton: {
                                                disabled:
                                                    !pageInfo.hasPreviousPage,
                                            },
                                            nextButton: {
                                                disabled: !pageInfo.hasNextPage,
                                            },
                                        },
                                    }}
                                />
                            </TableRow>
                        </TableFooter>
                    ) : null}
                </Table>
            </TableContainer>
        </Box>
    );
}
