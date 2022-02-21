import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

export type Order = 'asc' | 'desc';

// The property: any used to be "keyof Data" - need to add that back in later
export interface HeadCell {
    disablePadding: boolean;
    id: any;
    label: string;
    numeric: boolean;
}

// The property: any used to be "keyof Data" - need to add that back in later
export interface SortableTableHeaderProps {
    headCells: HeadCell[];
    onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
    order: Order;
    orderBy: string;
}

// The propery: any used to be "keyof Data" - need to add that back in later
function SortableTableHeader(props: SortableTableHeaderProps) {
    const { headCells, order, orderBy, onRequestSort } = props;
    const createSortHandler =
        (property: any) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableRow>
            {headCells.map((headCell) => (
                <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === headCell.id ? order : false}
                >
                    <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                    >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc'
                                    ? 'sorted descending'
                                    : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                </TableCell>
            ))}
        </TableRow>
    );
}

export default SortableTableHeader;
