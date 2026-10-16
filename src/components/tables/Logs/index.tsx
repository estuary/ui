import type { VariableSizeList } from 'react-window';

import { useLayoutEffect, useRef } from 'react';

import {
    Box,
    Stack,
    Table,
    tableCellClasses,
    TableContainer,
    tableHeadClasses,
    tableRowClasses,
} from '@mui/material';

import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import LogsTableBody from 'src/components/tables/Logs/Body';
import HydrationWarning from 'src/components/tables/Logs/HydrationWarning';
import { LevelFilter } from 'src/components/tables/Logs/LevelFilter';
import useLogColumns from 'src/components/tables/Logs/useLogColumns';
import { defaultOutlineColor } from 'src/context/Theme';
import { useReactWindowReadyToScroll } from 'src/hooks/useReactWindowReadyToScroll';
import {
    useJournalDataLogs_itemData,
    useJournalDataLogs_toFilteredIndex,
} from 'src/stores/JournalData/Logs/hooks';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

const TABLE_HEIGHT = 600;

function LogsTable() {
    const columns = useLogColumns();

    const hydrated = useJournalDataLogsStore((state) => state.hydrated);
    const setAllowFetchingMore = useJournalDataLogsStore(
        (state) => state.setAllowFetchingMore
    );
    const [scrollToIndex, scrollToPosition] = useJournalDataLogsStore(
        (state) => state.scrollToWhenDone
    );
    const levelFilter = useJournalDataLogsStore((state) => state.levelFilter);
    const loadedCount = useJournalDataLogsStore(
        (state) => state.documents?.length ?? 0
    );

    const itemData = useJournalDataLogs_itemData();
    // Two fake rows wrap the documents
    const visibleCount = itemData ? itemData.length - 2 : 0;

    // Read through a ref so new documents (which change the mapping) do not
    //  re-run the scroll effect and yank the user back to the last target
    const toFilteredIndex = useJournalDataLogs_toFilteredIndex();
    const toFilteredIndexRef = useRef(toFilteredIndex);
    toFilteredIndexRef.current = toFilteredIndex;

    const tableScroller = useRef<VariableSizeList | undefined>(undefined);
    const outerRef = useRef<HTMLDivElement | undefined>(undefined);
    const virtualRows = useRef<HTMLDivElement | undefined>(undefined);
    const enableFetchingMore = useRef<boolean>(true);

    const { readyToScroll, scrollingElementCallback } =
        useReactWindowReadyToScroll<VariableSizeList>(tableScroller);

    useLayoutEffect(() => {
        if (readyToScroll && scrollToIndex > 0 && tableScroller.current) {
            tableScroller.current.scrollToItem(
                toFilteredIndexRef.current(scrollToIndex),
                scrollToPosition
            );

            // tableScroller.current.props.innerRef.current.offsetHeight

            // Since we have scrolled once we can enable this now
            if (enableFetchingMore.current) {
                setAllowFetchingMore(true);
            }
        }
    }, [setAllowFetchingMore, scrollToIndex, scrollToPosition, readyToScroll]);

    // Changing the filter changes every row index, so jump to the newest lines
    const previousLevelFilter = useRef(levelFilter);
    const itemCount = itemData?.length ?? 0;
    useLayoutEffect(() => {
        if (previousLevelFilter.current === levelFilter) {
            return;
        }

        previousLevelFilter.current = levelFilter;
        if (readyToScroll && itemCount > 0 && tableScroller.current) {
            tableScroller.current.scrollToItem(itemCount - 1, 'end');
        }
    }, [itemCount, levelFilter, readyToScroll]);

    return (
        <Stack spacing={2}>
            <HydrationWarning />
            <LevelFilter
                loadedCount={loadedCount}
                visibleCount={visibleCount}
            />
            <TableContainer
                component={Box}
                width="100%"
                sx={{
                    overflow: 'unset',
                    height: hydrated ? TABLE_HEIGHT : 200,
                }}
            >
                <Table
                    aria-label="Task Logs"
                    component={Box}
                    size="small"
                    stickyHeader
                    sx={{
                        minWidth: 250,
                        width: '100%',
                        height: '100%',
                        // Keeps the header showing the border row on the header and not the cells
                        //  becaues they do not take the entire width
                        borderCollapse: 'collapse',
                        [`& > .${tableHeadClasses.root} .${tableRowClasses.root}`]:
                            {
                                borderBottomColor: (theme) =>
                                    defaultOutlineColor[theme.palette.mode],
                                borderBottomWidth: 1,
                                borderBottomStyle: 'solid',
                            },
                        [`& > .${tableHeadClasses.root} .${tableRowClasses.root} .${tableCellClasses.root}`]:
                            {
                                borderBottom: 'none',
                            },
                    }}
                >
                    <EntityTableHeader
                        columns={columns}
                        enableDivRendering
                        height={35} // This is required for FF to render the body for some reason
                    />

                    <LogsTableBody
                        itemData={itemData}
                        outerRef={outerRef}
                        tableScroller={scrollingElementCallback}
                        virtualRows={virtualRows}
                    />
                </Table>
            </TableContainer>
            {/*<TailNewLogs />*/}
        </Stack>
    );
}

export default LogsTable;
