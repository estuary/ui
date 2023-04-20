import { Box, Table, TableContainer } from '@mui/material';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { TableColumns, TableState, TableStatuses } from 'types';
import EntityTableBody from '../EntityTable/TableBody';
import Rows from './Rows';

export const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: 'data.name',
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

// const selectableTableStoreName = SelectTableStoreNames.BILLING;

interface Props {
    inferredSchema: any;
}

function SchemaPropertiesTable({ inferredSchema }: Props) {
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (inferredSchema && inferredSchema.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [inferredSchema]);

    console.log('schema table renderer', {
        tableState,
    });

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
                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'schemaEditor.table.empty.header',
                            message: 'schemaEditor.table.empty.message',
                            disableDoclink: true,
                        }}
                        tableState={tableState}
                        loading={!inferredSchema}
                        rows={<Rows data={inferredSchema} />}
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default SchemaPropertiesTable;
