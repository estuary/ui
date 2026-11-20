import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { compactTableSx } from 'src/components/admin/Settings/DataPlanes/compactTableSx';
import Rows from 'src/components/tables/DataPlanes/Rows';
import { paperBackground } from 'src/context/Theme';
import { usePublicDataPlanesQuery } from 'src/hooks/dataPlanes/useDataPlanes';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

const PAGE_SIZE = 10;

export function PublicDataPlanesTable({ tenant }: { tenant: string }) {
    const { currentPage, cursor, onPageChange } = useCursorPagination();
    const { dataPlanes, fetching, error, pageInfo } = usePublicDataPlanesQuery(
        tenant,
        PAGE_SIZE,
        cursor
    );

    const handlePageChange = (event: any, newPage: number) => {
        onPageChange(event, newPage, pageInfo?.endCursor);
    };

    const labelDisplayedRows = ({ from }: { from: number }) => {
        return dataPlanes.length > 0
            ? `${from}–${from + dataPlanes.length - 1}`
            : '';
    };

    return (
        <Paper
            variant="outlined"
            sx={{ bgcolor: (theme) => paperBackground[theme.palette.mode] }}
        >
            <TableContainer>
                <Table
                    size="small"
                    aria-label="Public data planes"
                    sx={compactTableSx}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell scope="col">Data plane</TableCell>
                            <TableCell scope="col">Region</TableCell>
                            <TableCell scope="col">IPv4 egress</TableCell>
                            <TableCell scope="col" aria-label="Actions" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fetching || error || dataPlanes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        role={error ? 'alert' : 'status'}
                                    >
                                        {fetching
                                            ? 'Loading public data planes…'
                                            : error
                                              ? 'Public data planes could not be loaded.'
                                              : 'No public data planes found.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <Rows data={dataPlanes} />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {currentPage > 0 || pageInfo?.hasNextPage ? (
                <TablePagination
                    component="div"
                    count={-1}
                    page={currentPage}
                    rowsPerPage={PAGE_SIZE}
                    rowsPerPageOptions={[PAGE_SIZE]}
                    onPageChange={handlePageChange}
                    labelDisplayedRows={labelDisplayedRows}
                    slotProps={{
                        actions: {
                            previousButton: {
                                disabled:
                                    fetching || !pageInfo?.hasPreviousPage,
                            },
                            nextButton: {
                                disabled: fetching || !pageInfo?.hasNextPage,
                            },
                        },
                    }}
                />
            ) : null}
        </Paper>
    );
}
