import type { EntityTableHeaderProps } from 'src/components/tables/EntityTable/types';

import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

import { ArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { TABLE_HEADER_CELL_CLASS_PREFIX } from 'src/components/tables/EntityTable/shared';
import {
    getStickyTableCell,
    wrappingTableBodyHeader,
    zIndexIncrement,
} from 'src/context/Theme';
import { getTableComponents } from 'src/utils/table-utils';

function EntityTableHeader({
    columns,
    columnToSort,
    disableBackground,
    enableDivRendering,
    headerClick,
    height,
    hide,
    selectData,
    selectableTableStoreName,
    sortDirection,
}: EntityTableHeaderProps) {
    const enableSort = Boolean(columnToSort && headerClick && sortDirection);

    const { theaderComponent, tdComponent, trComponent } =
        getTableComponents(enableDivRendering);

    return (
        <TableHead component={theaderComponent} sx={{ height }}>
            <TableRow
                component={trComponent}
                sx={{
                    background: disableBackground
                        ? 'transparent'
                        : (theme) => theme.palette.background.default,
                    height,
                    position: 'relative',
                    zIndex: zIndexIncrement,
                    ['& .MuiTableCell-root']: {
                        background: disableBackground
                            ? 'transparent'
                            : undefined,
                    },
                }}
            >
                {columns.map((column, index) => {
                    let tableCellSX = {};

                    if (column.minWidth) {
                        tableCellSX = {
                            ...tableCellSX,
                            minWidth: column.minWidth,
                        };
                    }

                    if (column.sticky) {
                        tableCellSX = {
                            ...getStickyTableCell(true),
                        };
                    }

                    if (column.columnWraps) {
                        tableCellSX = {
                            ...wrappingTableBodyHeader,
                        };
                    }

                    if (column.width) {
                        tableCellSX = {
                            ...tableCellSX,
                            width: column.width,
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

                    if (column.display) {
                        tableCellSX = {
                            ...tableCellSX,
                            display: column.display,
                        };
                    }

                    if (column.flexGrow) {
                        tableCellSX = {
                            ...tableCellSX,
                            flexGrow: 1,
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
                            className={`${TABLE_HEADER_CELL_CLASS_PREFIX}${column.field}`}
                            component={tdComponent}
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
                            {column.renderInlineHeader && !hide ? (
                                column.renderInlineHeader(index)
                            ) : selectData && column.field && !hide ? (
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
