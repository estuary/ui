import type { SchemaPropertiesTableProps } from 'src/components/tables/Schema/types';
import type { SortDirection, TableState } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Table, TableContainer } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_skimProjectionDoneProcessing,
    useBindingsEditorStore_skimProjectionResponse,
    useBindingsEditorStore_skimProjectionResponseEmpty,
} from 'src/components/editor/Bindings/Store/hooks';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/Schema/Rows';
import {
    actionColumn,
    columns,
    optionalColumns,
} from 'src/components/tables/Schema/shared';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { useEntityWorkflow } from 'src/context/Workflow';
import { TablePrefixes } from 'src/stores/Tables/hooks';
import { TableStatuses } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

function SchemaPropertiesTable({ filter }: SchemaPropertiesTableProps) {
    const intl = useIntl();

    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState('name');

    const skimProjectionResponse =
        useBindingsEditorStore_skimProjectionResponse();
    const skimProjectionDoneProcessing =
        useBindingsEditorStore_skimProjectionDoneProcessing();
    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const handlers = {
        sortRequest: (_event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: any) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
    };

    useEffect(() => {
        if (skimProjectionDoneProcessing) {
            if (skimProjectionResponse && skimProjectionResponse.length > 0) {
                setTableState({ status: TableStatuses.DATA_FETCHED });
            } else {
                setTableState({ status: TableStatuses.NO_EXISTING_DATA });
            }
        } else {
            setTableState({ status: TableStatuses.LOADING });
        }
    }, [skimProjectionDoneProcessing, skimProjectionResponse]);

    const data = useMemo(() => {
        if (skimProjectionResponseEmpty || !skimProjectionResponse) {
            return [];
        }

        if (filter === 'all') {
            return skimProjectionResponse.filter((datum) => !datum.explicit);
        }

        return skimProjectionResponse.filter(
            (datum) => !datum.explicit && datum.inference.exists === filter
        );
    }, [filter, skimProjectionResponse, skimProjectionResponseEmpty]);

    const { tableSettings } = useDisplayTableColumns();

    const columnsToShow = useMemo(() => {
        const evaluatedColumns = isCaptureWorkflow
            ? columns.concat([actionColumn])
            : columns;

        return evaluateColumnsToShow(
            optionalColumns,
            evaluatedColumns,
            TablePrefixes.schemaViewer,
            tableSettings,
            !isCaptureWorkflow
        );
    }, [isCaptureWorkflow, tableSettings]);

    return (
        <Box>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350, borderCollapse: 'separate' }}
                    aria-label={intl.formatMessage({
                        id: 'entityTable.title',
                    })}
                >
                    <EntityTableHeader
                        columns={columnsToShow}
                        columnToSort={columnToSort}
                        sortDirection={sortDirection}
                        headerClick={handlers.sort}
                        selectData={true} // We aren't fetching data so we can hardcode this to true
                    />

                    <EntityTableBody
                        columns={columnsToShow}
                        noExistingDataContentIds={{
                            header: 'schemaEditor.table.empty.header',
                            message: skimProjectionResponseEmpty
                                ? 'schemaEditor.table.empty.message'
                                : 'schemaEditor.table.empty.filtered.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={!skimProjectionDoneProcessing}
                        rows={
                            hasLength(data) ? (
                                <Rows
                                    columns={columnsToShow}
                                    data={data}
                                    sortDirection={sortDirection}
                                    columnToSort={columnToSort}
                                />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default SchemaPropertiesTable;
