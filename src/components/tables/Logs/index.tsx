import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Table, TableContainer } from '@mui/material';
import {
    useJournalDataLogsStore_scrollToWhenDone,
    useJournalDataLogsStore_setAllowFetchingMore,
} from 'stores/JournalData/Logs/hooks';
import EntityTableHeader from '../EntityTable/TableHeader';
import useLogColumns from './useLogColumns';
import LogsTableBody from './Body';

function LogsTable() {
    const intl = useIntl();
    const columns = useLogColumns();

    const allowFetchingMore = useJournalDataLogsStore_setAllowFetchingMore();
    const [scrollToIndex, scrollToPosition] =
        useJournalDataLogsStore_scrollToWhenDone();

    const tableScroller = useRef<any>(null);
    const outerRef = useRef<any>(null);
    const virtualRows = useRef<any>(null);
    const enableFetchingMore = useRef<boolean>(true);
    const [readyToScroll, setReadyToScroll] = useState(false);

    const tableScrollerCallback = useCallback((node) => {
        if (node) {
            tableScroller.current = node;
            setReadyToScroll(true);
        } else {
            return tableScroller.current;
        }
    }, []);

    useLayoutEffect(() => {
        console.log('scrolling effect', [
            scrollToIndex,
            scrollToPosition,
            tableScroller.current,
        ]);
        if (readyToScroll && scrollToIndex > 0 && tableScroller.current) {
            console.log('scrolling effect scrolling');
            tableScroller.current.scrollToItem(scrollToIndex, scrollToPosition);

            // Since we have scrolled once we can enable this now
            if (enableFetchingMore.current) {
                allowFetchingMore(true);
            }
        }
    }, [allowFetchingMore, scrollToIndex, scrollToPosition, readyToScroll]);

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
                    tableScroller={tableScrollerCallback}
                    virtualRows={virtualRows}
                />
            </Table>
        </TableContainer>
    );
}

export default LogsTable;
