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
    noBackgroundColor?: boolean;
}

function EntityTableHeader({
    columns,
    columnToSort,
    headerClick,
    hide,
    selectData,
    selectableTableStoreName,
    sortDirection,
    noBackgroundColor,
}: Props) {
    const enableSort = Boolean(columnToSort && headerClick && sortDirection);

    return (
        <TableHead>
            <TableRow
                sx={{
                    background: noBackgroundColor
                        ? undefined
                        : (theme) => theme.palette.background.default,
                }}
            >
                {columns.map((column, index) => {
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
                            sx={
                                column.sticky
                                    ? getStickyTableCell(true)
                                    : undefined
                            }
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
