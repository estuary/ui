import {
    Checkbox,
    Paper,
    Stack,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import Table from '@mui/material/Table';
import { Box } from '@mui/system';
import React, { useCallback } from 'react';
import { FakeDataDef } from './FakeTableData';
import SortableTableHeader, { HeadCell, Order } from './SortableTableHeader';
import SortableTableToolbar from './SortableTableToolbar';

type SortableTableProps = {
    rows: FakeDataDef[];
    headers: HeadCell[];
};

function SortableTable(props: SortableTableProps) {
    const { headers, rows } = props;

    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<any>('lastUpdated');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);

    const [searchScope, setSearchScope] = React.useState<string | null>('all');

    const handleAlignment = useCallback(() => {
        setSearchScope(searchScope);
    }, [searchScope]);

    function generateRowLabelID(row: FakeDataDef, index: number) {
        return `${row.name}_${row.id}_${index}`;
    }

    function getComparator<Key extends keyof any>(
        order: Order,
        orderBy: Key
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string }
    ) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const handleRequestSort = (_event: any, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let newSelecteds: string[] = [];

        if (event.target.checked) {
            newSelecteds = rows.map(generateRowLabelID);
        }

        setSelected(newSelecteds);
    };

    const handleClick = (_event: any, rowLabel: string) => {
        const selectedIndex = selected.indexOf(rowLabel);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, rowLabel);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        console.log('Going to set selected to', newSelected);

        setSelected(newSelected);
    };

    const handleChangePage = (_event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = () => {
        setRowsPerPage(rowsPerPage);
        setPage(0);
    };

    const isSelected = (rowLabel: string) => selected.indexOf(rowLabel) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Box>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    float: 'right',
                }}
            >
                <ToggleButtonGroup
                    aria-label="scope of search"
                    exclusive
                    size="small"
                    value={searchScope}
                    onChange={handleAlignment}
                >
                    <ToggleButton
                        aria-label="search all collections"
                        value="all"
                    >
                        All
                    </ToggleButton>
                    <ToggleButton
                        aria-label="search active collections"
                        value="active"
                    >
                        Active
                    </ToggleButton>
                    <ToggleButton
                        aria-label="search all paused collections"
                        value="paused"
                    >
                        Paused
                    </ToggleButton>
                </ToggleButtonGroup>
                <TextField
                    id="outlined-search"
                    label="Search for collection"
                    type="search"
                    variant="filled"
                />
            </Stack>
            <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
                <TableContainer>
                    <SortableTableToolbar
                        header="All Collections"
                        numSelected={selected.length}
                    />
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size="small"
                        stickyHeader
                    >
                        <TableHead sx={{ borderBottom: 2 }}>
                            <SortableTableHeader
                                headCells={headers}
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                            />
                        </TableHead>
                        <TableBody>
                            {rows
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
                                    const isItemSelected = isSelected(rowLabel);

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) =>
                                                handleClick(event, rowLabel)
                                            }
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={rowLabel}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby':
                                                            rowLabel,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                id={rowLabel}
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
                                })}
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
