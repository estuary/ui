import {
    Box,
    Stack,
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

import { FormattedMessage } from 'react-intl';

import { useRefreshTokens } from 'src/api/gql/refreshTokens';
import ConfigureRefreshTokenButton from 'src/components/admin/Api/RefreshToken/ConfigureTokenButton';
import Rows from 'src/components/tables/RefreshTokens/Rows';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

function RefreshTokenTable() {
    const { currentPage, cursor, onPageChange } = useCursorPagination();

    const { refreshTokens, fetching, error, pageInfo, pageSize } =
        useRefreshTokens(cursor);

    const handlePageChange = (_event: any, page: number) => {
        onPageChange(_event, page, pageInfo?.endCursor);
    };

    return (
        <Box sx={{ mx: 2 }}>
            <Stack
                direction="row"
                sx={{ mb: 1, justifyContent: 'flex-end', alignItems: 'center' }}
            >
                <ConfigureRefreshTokenButton />
            </Stack>

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
                                <FormattedMessage id="entityTable.data.description" />
                            </TableCell>
                            <TableCell>
                                <FormattedMessage id="entityTable.data.status" />
                            </TableCell>
                            <TableCell sx={{ width: 125 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fetching && refreshTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : refreshTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <Typography sx={{ py: 2 }}>
                                        <FormattedMessage id="admin.cli_api.refreshToken.table.noContent.header" />
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        <FormattedMessage id="admin.cli_api.refreshToken.table.noContent.message" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <Rows data={refreshTokens} />
                        )}
                    </TableBody>

                    {pageInfo ? (
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

export default RefreshTokenTable;
