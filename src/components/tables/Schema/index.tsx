import { Box, Table, TableContainer } from '@mui/material';
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

interface Props {
    inferSchemaResponse: any;
}

function SchemaPropertiesTable({ inferSchemaResponse }: Props) {
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (inferSchemaResponse && inferSchemaResponse.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [inferSchemaResponse]);

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
                        loading={!inferSchemaResponse}
                        rows={<Rows data={inferSchemaResponse} />}
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default SchemaPropertiesTable;
