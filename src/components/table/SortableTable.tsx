import {
    Box,
    Paper,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import Table from '@mui/material/Table';
import { useState } from 'react';
import SortableTableHeader, { HeadCell, Order } from './SortableTableHeader';
import SortableTableToolbar from './SortableTableToolbar';

type SortableTableProps = {
    rows: any[];
    headers: HeadCell[];
};

function SortableTable(props: SortableTableProps) {
    const { headers, rows } = props;

    const toolbarId = 'tableTitle';
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<any>('lastUpdated');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    function generateRowLabelID(row: any, index: number) {
        return `${row.name}_${row.id}_${index}`;
    }

    function getComparator<Key extends keyof any>(
        compareOrder: Order,
        compareOrderBy: Key
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string }
    ) => number {
        return compareOrder === 'desc'
            ? (a, b) => descendingComparator(a, b, compareOrderBy)
            : (a, b) => -descendingComparator(a, b, compareOrderBy);
    }

    function descendingComparator<T>(a: T, b: T, descCompareOrderBy: keyof T) {
        if (b[descCompareOrderBy] < a[descCompareOrderBy]) {
            return -1;
        }
        if (b[descCompareOrderBy] > a[descCompareOrderBy]) {
            return 1;
        }
        return 0;
    }

    const handleRequestSort = (_event: any, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = () => {
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Box>
            <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
                <TableContainer>
                    <SortableTableToolbar
                        header="All Collections"
                        toolbarID={toolbarId}
                    />
                    <Table
                        aria-labelledby={toolbarId}
                        size="small"
                        stickyHeader
                    >
                        <TableHead sx={{ borderBottom: 2 }}>
                            <SortableTableHeader
                                headCells={headers}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                            />
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                    )
                                    .sort(getComparator(order, orderBy))
                                    .map((row, index) => {
                                        const rowLabel = generateRowLabelID(
                                            row,
                                            index
                                        );

                                        return (
                                            <TableRow
                                                hover
                                                tabIndex={-1}
                                                key={rowLabel}
                                            >
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                    padding="none"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.lastChange}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.size}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.owner}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.description}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {row.org}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            ) : (
                                <TableRow>
                                    <TableCell align="center">
                                        no rows
                                    </TableCell>
                                </TableRow>
                            )}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 33 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={rows.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[rowsPerPage]}
                    showFirstButton
                    showLastButton
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

export default SortableTable;
