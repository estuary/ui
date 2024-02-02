import { useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box, Table, TableContainer } from '@mui/material';
import {
    useJournalDataLogsStore_fetchingMore,
    useJournalDataLogsStore_scrollToWhenDone,
} from 'stores/JournalData/Logs/hooks';
import EntityTableHeader from '../EntityTable/TableHeader';
import useLogColumns from './useLogColumns';
import LogsTableBody from './Body';

function LogsTable() {
    const intl = useIntl();
    const columns = useLogColumns();

    const fetchingMore = useJournalDataLogsStore_fetchingMore();
    const [scrollToIndex, scrollToPosition] =
        useJournalDataLogsStore_scrollToWhenDone();

    const tableScroller = useRef<any>(null);
    const outerRef = useRef<any>(null);
    const virtualRows = useRef<any>(null);

    useLayoutEffect(() => {
        console.log('scrolling effect', [
            scrollToIndex,
            scrollToPosition,
            tableScroller.current,
        ]);
        if (scrollToIndex > 0 && tableScroller.current) {
            console.log('scrolling effect scrolling');
            tableScroller.current.scrollToItem(scrollToIndex, scrollToPosition);
        }
    }, [fetchingMore, scrollToIndex, scrollToPosition]);

    return (
        <TableContainer
            component={Box}
            width="100%"
            sx={{ overflow: 'unset', height: 500 }}
        >
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                component={Box}
                size="small"
                stickyHeader
                sx={{ minWidth: 250, width: '100%', height: '100%' }}
            >
                <EntityTableHeader
                    columns={columns}
                    enableDivRendering
                    height={35} // This is required for FF to render the body for some reason
                />

                <LogsTableBody
                    outerRef={outerRef}
                    tableScroller={tableScroller}
                    virtualRows={virtualRows}
                />
            </Table>
        </TableContainer>
    );
}

export default LogsTable;
