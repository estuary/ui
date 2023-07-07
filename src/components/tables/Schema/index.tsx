import { Box, Table, TableContainer } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaResponse,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_inferSchemaResponseEmpty,
} from 'components/editor/Bindings/Store/hooks';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { SortDirection, TableColumns, TableState, TableStatuses } from 'types';
import EntityTableBody from '../EntityTable/TableBody';
import EntityTableHeader from '../EntityTable/TableHeader';
import Rows from './Rows';

export const columns: TableColumns[] = [
    {
        field: 'name',
        headerIntlKey: 'data.field',
    },
    {
        field: 'pointer',
        headerIntlKey: 'data.pointer',
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
    {
        field: 'exists',
        headerIntlKey: 'data.exists',
    },
];

function SchemaPropertiesTable() {
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState('name');

    const inferSchemaResponse = useBindingsEditorStore_inferSchemaResponse();
    const inferSchemaDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

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
        if (inferSchemaDoneProcessing) {
            if (inferSchemaResponse && inferSchemaResponse.length > 0) {
                setTableState({ status: TableStatuses.DATA_FETCHED });
            } else {
                setTableState({ status: TableStatuses.NO_EXISTING_DATA });
            }
        } else {
            setTableState({ status: TableStatuses.LOADING });
        }
    }, [inferSchemaDoneProcessing, inferSchemaResponse]);

    return (
        <Box>
            <TableContainer component={Box}>
                <Table
                    size="small"
                    sx={{ minWidth: 350 }}
                    aria-label={intl.formatMessage({
                        id: 'entityTable.title',
                    })}
                >
                    <EntityTableHeader
                        columns={columns}
                        columnToSort={columnToSort}
                        sortDirection={sortDirection}
                        headerClick={handlers.sort}
                        selectData={true} // We aren't fetching data so we can hardcode this to true
                    />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'schemaEditor.table.empty.header',
                            message: 'schemaEditor.table.empty.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={!inferSchemaDoneProcessing}
                        rows={
                            !inferSchemaResponseEmpty ? (
                                <Rows
                                    data={inferSchemaResponse}
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
