import type { VariableSizeList } from 'react-window';

import { useLayoutEffect, useRef } from 'react';

import { Box, Table, TableContainer } from '@mui/material';

import { useIntl } from 'react-intl';

import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import LogsTableBody from 'src/components/tables/Logs/Body';
import useLogColumns from 'src/components/tables/Logs/useLogColumns';
import { defaultOutlineColor } from 'src/context/Theme';
import { useReactWindowReadyToScroll } from 'src/hooks/useReactWindowReadyToScroll';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

const TABLE_HEIGHT = 600;

function LogsTable() {
    const intl = useIntl();
    const columns = useLogColumns();

    const [hydrated, setAllowFetchingMore, [scrollToIndex, scrollToPosition]] =
        useJournalDataLogsStore((state) => [
            state.hydrated,
            state.setAllowFetchingMore,
            state.scrollToWhenDone,
        ]);

    const tableScroller = useRef<VariableSizeList | undefined>(undefined);
    const outerRef = useRef<HTMLDivElement | undefined>(undefined);
    const virtualRows = useRef<HTMLDivElement | undefined>(undefined);
    const enableFetchingMore = useRef<boolean>(true);

    const { readyToScroll, scrollingElementCallback } =
        useReactWindowReadyToScroll<VariableSizeList>(tableScroller);

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
        <Box>
            <TableContainer
                component={Box}
                width="100%"
                sx={{
                    overflow: 'unset',
                    height: hydrated ? TABLE_HEIGHT : 200,
                }}
            >
                <Table
                    aria-label={intl.formatMessage({
                        id: 'entityTable.title',
                    })}
                    component={Box}
                    size="small"
                    stickyHeader
                    sx={{
                        'minWidth': 250,
                        'width': '100%',
                        'height': '100%',
                        // Keeps the header showing the border row on the header and not the cells
                        //  becaues they do not take the entire width
                        'borderCollapse': 'collapse',
                        '& > .MuiTableHead-root .MuiTableRow-root': {
                            borderBottomColor: (theme) =>
                                defaultOutlineColor[theme.palette.mode],
                            borderBottomWidth: 1,
                            borderBottomStyle: 'solid',
                        },
                        '& > .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root':
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
                        outerRef={outerRef}
                        tableScroller={scrollingElementCallback}
                        virtualRows={virtualRows}
                    />
                </Table>
            </TableContainer>
            {/*<TailNewLogs />*/}
        </Box>
    );
}

export default LogsTable;
