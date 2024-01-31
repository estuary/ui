import { findIndex } from 'lodash';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box, LinearProgress, Table, TableContainer } from '@mui/material';
import {
    useJournalDataLogsStore_documentCount,
    useJournalDataLogsStore_documents,
    useJournalDataLogsStore_fetchingNewer,
    useJournalDataLogsStore_fetchingOlder,
    useJournalDataLogsStore_lastCount,
    useJournalDataLogsStore_olderFinished,
    useJournalDataLogsStore_setFetchingNewer,
    useJournalDataLogsStore_setFetchingOlder,
    useJournalDataLogsStore_setLastTimeCheckedForNew,
} from 'stores/JournalData/Logs/hooks';
import EntityTableHeader from '../EntityTable/TableHeader';
import useLogColumns from './useLogColumns';
import { DEFAULT_ROW_HEIGHT } from './shared';
import LogsTableFooter from './Footer';
import LogsTableBody from './Body';

interface Props {
    fetchNewer: () => void;
    fetchOlder: () => void;
    loading?: boolean;
}

function LogsTable({ fetchNewer, fetchOlder, loading }: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const documents = useJournalDataLogsStore_documents();
    const documentCount = useJournalDataLogsStore_documentCount();
    const lastCount = useJournalDataLogsStore_lastCount();
    const fetchingNewer = useJournalDataLogsStore_fetchingNewer();
    const fetchingOlder = useJournalDataLogsStore_fetchingOlder();
    const olderFinished = useJournalDataLogsStore_olderFinished();
    const setFetchingOlder = useJournalDataLogsStore_setFetchingOlder();
    const setFetchingNewer = useJournalDataLogsStore_setFetchingNewer();
    const setLastTimeCheckedForNew =
        useJournalDataLogsStore_setLastTimeCheckedForNew();

    // Local refs for handling scrolling
    const tableScroller = useRef<any>(null);
    const outerRef = useRef<any>(null);
    const virtualRows = useRef<any>(null);
    const lastTopLog = useRef<string | null>(null);
    const scrollOnLoad = useRef(true);

    const onScroll = ({ scrollOffset, scrollDirection }: any) => {
        // If we're already loading do not need to kick another call off
        if (fetchingNewer || fetchingOlder) {
            return;
        }

        // Need to figure out if scrolling is at bottom
        if (
            scrollDirection === 'forward' &&
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            scrollOffset + outerRef.current.offsetHeight + DEFAULT_ROW_HEIGHT >=
                outerRef.current.scrollHeight
        ) {
            setLastTimeCheckedForNew(null);
            setFetchingNewer(true);
            fetchNewer();
        } else if (
            !olderFinished &&
            scrollOffset === 0 &&
            scrollDirection === 'backward'
        ) {
            setFetchingOlder(true);
            fetchOlder();
        }
    };

    // Keep track of the top item so we can keep it in view when more logs are loaded
    useEffect(() => {
        if (!documents) {
            return;
        }

        // Move to store
        lastTopLog.current = documents[0]._meta.uuid;
    }, [documents]);

    useLayoutEffect(() => {
        if (!fetchingOlder && !fetchingNewer) {
            return;
        }

        if (lastCount < documentCount) {
            if (fetchingOlder) {
                tableScroller.current.scrollToItem(
                    findIndex(
                        documents,
                        (document) => document._meta.uuid === lastTopLog.current
                    ),
                    'top'
                );
            }

            if (fetchingNewer) {
                tableScroller.current.scrollToItem(documentCount, 'bottom');
            }
            setFetchingOlder(false);
            setFetchingNewer(false);
        } else if (fetchingNewer && lastCount === documentCount) {
            setLastTimeCheckedForNew(new Date().toISOString());
            setFetchingNewer(false);
        }
    }, [
        documentCount,
        documents,
        fetchingNewer,
        fetchingOlder,
        lastCount,
        setFetchingNewer,
        setFetchingOlder,
        setLastTimeCheckedForNew,
    ]);

    // On load scroll to near the bottom
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (scrollOnLoad?.current && tableScroller?.current) {
            scrollOnLoad.current = false;
            tableScroller.current.scrollToItem(
                documentCount > 1 ? Math.round(documentCount * 0.95) : 1
            );
        }
        // We only care about then the scroll ref is set so we can scroll to the bottom
        // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unnecessary-condition
    }, [tableScroller?.current]);

    return (
        <>
            {fetchingOlder ? <LinearProgress /> : null}
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
                    <EntityTableHeader columns={columns} enableDivRendering />

                    <LogsTableBody
                        onScroll={onScroll}
                        outerRef={outerRef}
                        tableScroller={tableScroller}
                        virtualRows={virtualRows}
                        loading={loading}
                    />

                    <LogsTableFooter />
                </Table>
            </TableContainer>
            {fetchingNewer ? <LinearProgress /> : null}
        </>
    );
}

export default LogsTable;
