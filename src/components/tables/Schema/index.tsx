import { Box } from '@mui/material';
import { TableColumns } from 'types';

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

function SchemaPropertiesTable() {
    return (
        <Box>
            {/*                <EntityTable
                    noExistingDataContentIds={{
                        header: 'admin.billing.table.history.emptyTableDefault.header',
                        message:
                            'admin.billing.table.history.emptyTableDefault.message',
                        disableDoclink: true,
                    }}
                    columns={columns}
                    renderTableRows={(data) => <Rows data={data} />}
                    header="Header Key"
                    filterLabel="Filter key"
                    selectableTableStoreName={selectableTableStoreName}
                    hideHeaderAndFooter={true}
                    rowsPerPageOptions={[4, 6, 12]}
                    minWidth={500}
                />*/}
        </Box>
    );
}

export default SchemaPropertiesTable;
