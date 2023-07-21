import { TableFooter, TablePagination, TableRow } from '@mui/material';

import { useZustandStore } from 'context/Zustand/provider';

import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

import TablePaginationActions from '../PaginationActions';

interface Props {
    onPageChange: any;
    onRowsPerPageChange: any;
    page: number;
    rowsPerPage: number;
    selectableTableStoreName: SelectTableStoreNames;
    hide?: boolean;
    rowsPerPageOptions?: number[];
}

function EntityTableFooter({
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
                    />
                </TableRow>
            </TableFooter>
        );
    } else {
        return null;
    }
}

export default EntityTableFooter;
