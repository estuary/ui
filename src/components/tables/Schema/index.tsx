import { useEffect, useMemo, useState } from 'react';

import { Box, Table, TableContainer } from '@mui/material';

import EntityTableBody from '../EntityTable/TableBody';
import EntityTableHeader from '../EntityTable/TableHeader';
import Rows from './Rows';
import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_inferSchemaResponse,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_inferSchemaResponseEmpty,
} from 'src/components/editor/Bindings/Store/hooks';
import { FieldFilter } from 'src/components/schema/types';
import {
    SortDirection,
    TableColumns,
    TableState,
    TableStatuses,
} from 'src/types';
import { hasLength } from 'src/utils/misc-utils';

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
        field: null,
        headerIntlKey: 'data.details',
    },
];

interface Props {
    filter: FieldFilter;
}

function SchemaPropertiesTable({ filter }: Props) {
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

    const data = useMemo(() => {
        if (inferSchemaResponseEmpty || !inferSchemaResponse) {
            return [];
        }

        if (filter === 'all') {
            return inferSchemaResponse;
        }

        return inferSchemaResponse.filter((datum) => datum.exists === filter);
    }, [filter, inferSchemaResponse, inferSchemaResponseEmpty]);

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
                            message: inferSchemaResponseEmpty
                                ? 'schemaEditor.table.empty.message'
                                : 'schemaEditor.table.empty.filtered.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={!inferSchemaDoneProcessing}
                        rows={
                            hasLength(data) ? (
                                <Rows
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
