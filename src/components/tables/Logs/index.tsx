import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Table, TableContainer } from '@mui/material';
import {
    useJournalDataLogsStore_scrollToWhenDone,
    useJournalDataLogsStore_setAllowFetchingMore,
} from 'stores/JournalData/Logs/hooks';
import { VariableSizeList } from 'react-window';
import EntityTableHeader from '../EntityTable/TableHeader';
import useLogColumns from './useLogColumns';
import LogsTableBody from './Body';

const TABLE_HEIGHT = 500;

function LogsTable() {
    const intl = useIntl();
    const columns = useLogColumns();

    const setAllowFetchingMore = useJournalDataLogsStore_setAllowFetchingMore();
    const [scrollToIndex, scrollToPosition] =
        useJournalDataLogsStore_scrollToWhenDone();

    const tableScroller = useRef<any>(null);
    const outerRef = useRef<any>(null);
    const virtualRows = useRef<any>(null);
    const enableFetchingMore = useRef<boolean>(true);
    const [readyToScroll, setReadyToScroll] = useState(false);

    const tableScrollerCallback = useCallback((node?: VariableSizeList) => {
        // If we get a node store that off and trigger a flag so we can do the initial scrolling
        //  This is gross but it works with the virtualization library we have and it let me get the job done
        if (node) {
            tableScroller.current = node;
            setReadyToScroll(true);
        }

        return tableScroller.current;
    }, []);

    useLayoutEffect(() => {
        if (readyToScroll && scrollToIndex > 0 && tableScroller.current) {
            tableScroller.current.scrollToItem(scrollToIndex, scrollToPosition);

            // tableScroller.current.props.innerRef.current.offsetHeight

            // Since we have scrolled once we can enable this now
            if (enableFetchingMore.current) {
                setAllowFetchingMore(true);
            }
        }
    }, [setAllowFetchingMore, scrollToIndex, scrollToPosition, readyToScroll]);

    return (
        <TableContainer
            component={Box}
            width="100%"
            sx={{ overflow: 'unset', height: TABLE_HEIGHT }}
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
