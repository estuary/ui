import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import useScrollIntoView from 'hooks/useScrollIntoView';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import useStayScrolled from 'react-stay-scrolled';
import { useScroll } from 'react-use';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import Rows from './Rows';
import useLogColumns from './useLogColumns';

interface Props {
    documents: OpsLogFlowDocument[];
    fetchNewer: () => void;
    fetchOlder: () => void;
    loading?: boolean;
}

function LogsTable({ documents, fetchNewer, fetchOlder, loading }: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const dataRows = useMemo(
        () =>
            documents.length > 0 ? (
                <Rows data={documents} loading={loading} />
            ) : null,
        [documents, loading]
    );

    console.log('loading', loading);

    const tableScroller = useRef<HTMLDivElement>(null);
    const { stayScrolled } = useStayScrolled(tableScroller);
    const scrollIntoView = useScrollIntoView(tableScroller);

    const { y } = useScroll(tableScroller);

    useEffect(() => {
        console.log('documents', documents);
        scrollIntoView();
    }, [documents, scrollIntoView]);

    useEffect(() => {
        // console.log('y', y);

        if (y === 0) {
            fetchOlder();
        } else {
            // Math.abs(tableScroller.scrollHeight - (tableScroller.scrollTop + tableScroller.clientHeight)) <= 1
            // eslint-disable-next-line no-lonely-if
            if (y > 500) {
                fetchNewer();
            }
        }
    }, [fetchNewer, fetchOlder, y]);

    useLayoutEffect(() => {
        console.log('they see me scrolling');
        stayScrolled();
    }, [documents, stayScrolled]);

    stayScrolled();

    return (
        <TableContainer component={Box} maxHeight={150} ref={tableScroller}>
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                size="small"
                stickyHeader
                sx={{ minWidth: 250 }}
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
