import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useZustandStore } from 'context/Zustand/provider';
import { ArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SortDirection } from 'types';
import { ColumnProps } from './types';

interface Props {
    columns: ColumnProps[];
    columnToSort: string;
    headerClick: (column: any) => (event: React.MouseEvent<unknown>) => void;
    selectableTableStoreName: SelectTableStoreNames;
    sortDirection: SortDirection;
    hide?: boolean;
}

function EntityTableHeader({
    columns,
    columnToSort,
    headerClick,
    hide,
    selectableTableStoreName,
    sortDirection,
}: Props) {
    const selectData = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['response']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.response);

    return (
        <TableHead>
            <TableRow
                sx={{
                    background: (theme) => theme.palette.background.default,
                }}
            >
                {columns.map((column, index) => {
                    if (column.renderHeader) {
                        return column.renderHeader(
                            index,
                            selectableTableStoreName
                        );
                    }

                    return (
                        <TableCell
                            key={`${column.field}-${index}`}
                            sortDirection={
                                columnToSort === column.field
                                    ? sortDirection
                                    : false
                            }
                        >
                            {selectData && column.field && !hide ? (
                                <TableSortLabel
                                    IconComponent={ArrowDown}
                                    active={columnToSort === column.field}
                                    direction={
                                        columnToSort === column.field
                                            ? sortDirection
                                            : 'asc'
                                    }
                                    onClick={headerClick(column.field)}
                                    sx={{
                                        '& .MuiTableSortLabel-icon': {
                                            fontSize: 14,
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
