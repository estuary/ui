import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Rows from './Rows';
import useLogColumns from './useLogColumns';

interface Props {
    documents: OpsLogFlowDocument[];
    loading?: boolean;
}

function LogsTable({ documents, loading }: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    console.log('documents', documents);

    const dataRows = useMemo(
        () => (documents.length > 0 ? <Rows data={documents} /> : null),
        [documents]
    );

    return (
        <TableContainer component={Box} maxHeight={500}>
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                size="small"
                stickyHeader
                sx={{ minWidth: 450 }}
            >
                <EntityTableHeader columns={columns} />

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
