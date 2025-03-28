import { TableFooter, TablePagination, TableRow } from '@mui/material';


import { useZustandStore } from 'src/context/Zustand/provider';
import type { SelectTableStoreNames } from 'src/stores/names';
import type {
    SelectableTableStore} from 'src/stores/Tables/Store';
import {
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import TablePaginationActions from 'src/components/tables/PaginationActions';

interface Props {
    filterLabel: string;
    onPageChange: any;
    onRowsPerPageChange: any;
    page: number;
    rowsPerPage: number;
    selectableTableStoreName: SelectTableStoreNames;
    hide?: boolean;
    rowsPerPageOptions?: number[];
}

function EntityTableFooter({
    filterLabel,
    hide,
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    selectableTableStoreName,
}: Props) {
    const selectDataCount = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['count']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.count);

    if (selectDataCount && !hide) {
        return (
            <TableFooter>
                <TableRow>
                    <TablePagination
                        ActionsComponent={TablePaginationActions}
                        rowsPerPageOptions={rowsPerPageOptions}
                        count={selectDataCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={onPageChange}
                        onRowsPerPageChange={onRowsPerPageChange}
                        SelectProps={{
                            // TODO (table filtering)
                            // Same as the other one
                            inputProps: {
                                id: `table_pagination__${filterLabel}`,
                            },
                        }}
                    />
                </TableRow>
            </TableFooter>
        );
    }

    return null;
}

export default EntityTableFooter;
