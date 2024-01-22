import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import useStayScrolled from 'react-stay-scrolled';
import { useScroll, useToggle } from 'react-use';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { hasLength } from 'utils/misc-utils';
import Rows from './Rows';
import useLogColumns from './useLogColumns';

interface Props {
    documents: OpsLogFlowDocument[];
    fetchNewer: () => void;
    fetchOlder?: () => void;
    loading?: boolean;
}

function LogsTable({ documents, fetchNewer, fetchOlder, loading }: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const dataRows = useMemo(
        () =>
            documents.length > 0 ? (
                <Rows
                    data={documents}
                    loading={loading}
                    hitFileStart={Boolean(!fetchOlder)}
                />
            ) : null,
        [fetchOlder, documents, loading]
    );

    const tableScroller = useRef<HTMLDivElement>(null);
    const { stayScrolled } = useStayScrolled(tableScroller);
    const [shouldScroll, toggleSchouldScroll] = useToggle(true);

    const { y } = useScroll(tableScroller);

    useEffect(() => {
        if (fetchOlder && y === 0) {
            fetchOlder();
        } else {
            // Math.abs(tableScroller.scrollHeight - (tableScroller.scrollTop + tableScroller.clientHeight)) <= 1
            // eslint-disable-next-line no-lonely-if
            if (y > 10000) {
                fetchNewer();
            }
        }
    }, [fetchNewer, fetchOlder, y]);

    useLayoutEffect(() => {
        if (hasLength(documents) && shouldScroll) {
            stayScrolled();
            toggleSchouldScroll();
        }
    }, [documents, shouldScroll, stayScrolled, toggleSchouldScroll]);

    stayScrolled();

    return (
        <TableContainer component={Box} maxHeight={500} ref={tableScroller}>
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
