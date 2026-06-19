import { useState } from 'react';

import {
    Box,
    Button,
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

import { useServiceAccounts } from 'src/api/gql/serviceAccounts';
import { CreateServiceAccountDialog } from 'src/components/admin/ServiceAccounts/CreateDialog';
import ServiceAccountRow from 'src/components/admin/ServiceAccounts/Row';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

// expand toggle + Name + Created + Last Used + API Keys
const COLUMN_COUNT = 5;

export function ServiceAccountsTable() {
    const { currentPage, cursor, onPageChange } = useCursorPagination();
    const { serviceAccounts, fetching, error, pageInfo, pageSize } =
        useServiceAccounts(cursor);

    const handlePageChange = (_event: any, page: number) => {
        onPageChange(_event, page, pageInfo?.endCursor);
    };

    const [createOpen, setCreateOpen] = useState(false);

    return (
        <Box>
            <Stack
                direction="row"
                sx={{ mb: 1, justifyContent: 'flex-end', alignItems: 'center' }}
            >
                <Button variant="outlined" onClick={() => setCreateOpen(true)}>
                    Create Service Account
                </Button>
            </Stack>

            <CreateServiceAccountDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error.message}
                </Typography>
            ) : null}

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 48 }} />
                            <TableCell>Name</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Last Used</TableCell>
                            <TableCell>API Keys</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fetching && serviceAccounts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : serviceAccounts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        No service accounts found.
                                    </Typography>
                                    <Typography
                                        component="a"
                                        variant="body2"
                                        color="primary"
                                        onClick={() => setCreateOpen(true)}
                                        sx={{
                                            'cursor': 'pointer',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Create one now
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            serviceAccounts.map((sa) => (
                                <ServiceAccountRow
                                    key={sa.catalogName}
                                    serviceAccount={sa}
                                />
                            ))
                        )}
                    </TableBody>

                    {pageInfo && serviceAccounts.length > 0 ? (
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
                                            from + serviceAccounts.length - 1;
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
