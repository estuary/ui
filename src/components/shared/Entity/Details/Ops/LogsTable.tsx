import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { TableColumns, TableStatuses } from 'types';
import LogRows from './LogRows';

interface Props {
    documents: any[];
    loading?: boolean;
}

export const columns: TableColumns[] = [
    {
        field: null,
        collapseHeader: true,
        headerIntlKey: 'ops.logsTable.label.level',
    },
    {
        field: null,
        collapseHeader: true,
        headerIntlKey: 'ops.logsTable.label.ts',
    },
    {
        field: null,
        collapseHeader: true,
        headerIntlKey: 'ops.logsTable.label.message',
    },
    {
        field: null,
        headerIntlKey: 'ops.logsTable.label.fields',
    },
];

function LogsTable({ documents, loading }: Props) {
    const intl = useIntl();

    const dataRows = useMemo(
        () => (documents.length > 0 ? <LogRows data={documents} /> : null),
        [documents]
    );

    return (
        <TableContainer component={Box}>
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                size="small"
                sx={{ minWidth: 450 }}
            >
                <EntityTableHeader columns={columns} noBackgroundColor />

                <EntityTableBody
                    columns={columns}
                    noExistingDataContentIds={{
                        header: 'ops.logsTable.emptyTableDefault.header',
                        message: 'ops.logsTable.emptyTableDefault.message',
                        disableDoclink: true,
                    }}
                    tableState={
                        documents.length > 0
                            ? { status: TableStatuses.DATA_FETCHED }
                            : { status: TableStatuses.NO_EXISTING_DATA }
                    }
                    loading={Boolean(loading)}
                    rows={dataRows}
                />
            </Table>
        </TableContainer>
    );
}

export default LogsTable;
