import { TableFooter, TablePagination, TableRow } from '@mui/material';

import TablePaginationActions from '../PaginationActions';

import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';

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
