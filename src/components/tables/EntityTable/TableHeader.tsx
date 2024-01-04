import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { getStickyTableCell } from 'context/Theme';
import { ArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';
import { ColumnProps } from './types';

interface Props {
    columns: ColumnProps[];
    headerClick?: (column: any) => (event: React.MouseEvent<unknown>) => void;
    hide?: boolean;
    columnToSort?: string;
    selectData?: any;
    selectableTableStoreName?: SelectTableStoreNames;
    sortDirection?: SortDirection;
}

function EntityTableHeader({
    columns,
    columnToSort,
    headerClick,
    hide,
    selectData,
    selectableTableStoreName,
    sortDirection,
}: Props) {
    const enableSort = Boolean(columnToSort && headerClick && sortDirection);

    return (
        <TableHead>
            <TableRow
                sx={{
                    background: (theme) => theme.palette.background.default,
                }}
            >
                {columns.map((column, index) => {
                    let tableCellSX = {};

                    if (column.sticky) {
                        tableCellSX = {
                            ...getStickyTableCell(true),
                        };
                    }

                    // If we have no message let the width be 0 so the cell can collapse
                    //   to the min-content of the column. Helpful for the button at the end of the table
                    if (column.collapseHeader) {
                        tableCellSX = {
                            ...tableCellSX,
                            width: 0,
                        };
                    }

                    if (column.renderHeader && selectableTableStoreName) {
                        return column.renderHeader(
                            index,
                            selectableTableStoreName
                        );
                    }

                    return (
                        <TableCell
                            key={`${column.field}-${index}`}
                            align={column.align}
                            sortDirection={
                                enableSort
                                    ? columnToSort === column.field
                                        ? sortDirection
                                        : false
                                    : undefined
                            }
                            sx={tableCellSX}
                        >
                            {selectData && column.field && !hide ? (
                                <TableSortLabel
                                    IconComponent={ArrowDown}
                                    active={columnToSort === column.field}
                                    direction={
                                        enableSort
                                            ? columnToSort === column.field
                                                ? sortDirection
                                                : 'asc'
                                            : undefined
                                    }
                                    onClick={
                                        headerClick
                                            ? headerClick(column.field)
                                            : undefined
                                    }
                                    sx={{
                                        '& .MuiTableSortLabel-icon': {
                                            fontSize: 10,
                                        },
                                    }}
                                >
                                    {column.headerIntlKey ? (
                                        <FormattedMessage
                                            id={column.headerIntlKey}
                                        />
                                    ) : null}
                                </TableSortLabel>
                            ) : column.headerIntlKey ? (
                                <FormattedMessage id={column.headerIntlKey} />
                            ) : null}
                        </TableCell>
                    );
                })}
            </TableRow>
        </TableHead>
    );
}

export default EntityTableHeader;
