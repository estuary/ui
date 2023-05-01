import { Box, Table, TableContainer } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaDoneProcessing,
    useBindingsEditorStore_inferSchemaResponse,
    useBindingsEditorStore_inferSchemaResponseEmpty,
} from 'components/editor/Bindings/Store/hooks';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { TableColumns, TableState, TableStatuses } from 'types';
import EntityTableBody from '../EntityTable/TableBody';
import EntityTableHeader from '../EntityTable/TableHeader';
import Rows from './Rows';

export const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: 'data.field',
    },
    {
        field: null,
        headerIntlKey: 'data.pointer',
    },
    {
        field: null,
        headerIntlKey: 'data.type',
    },
    {
        field: null,
        headerIntlKey: 'data.exists',
    },
];

function SchemaPropertiesTable() {
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const inferSchemaResponse = useBindingsEditorStore_inferSchemaResponse();
    const inferSchemaDoneProcessing =
        useBindingsEditorStore_inferSchemaDoneProcessing();
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

    useEffect(() => {
        console.log('ue', {
            inferSchemaDoneProcessing,
            inferSchemaResponse,
        });
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
                    <EntityTableHeader columns={columns} hide />

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
                                <Rows data={inferSchemaResponse} />
                            ) : null
                        }
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default SchemaPropertiesTable;
