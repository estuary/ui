import { findIndex } from 'lodash';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { OpsLogFlowDocument } from 'types';
import { Box, LinearProgress, Table, TableContainer } from '@mui/material';
import EntityTableHeader from '../EntityTable/TableHeader';
import useLogColumns from './useLogColumns';
import { DEFAULT_ROW_HEIGHT } from './shared';
import LogsTableFooter from './Footer';
import LogsTableBody from './Body';

interface Props {
    documents: OpsLogFlowDocument[];
    fetchNewer: () => void;
    fetchOlder?: () => void;
    loading?: boolean;
}

function LogsTable({ documents, fetchNewer, fetchOlder, loading }: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const tableScroller = useRef<any>(null);
    const outerRef = useRef<any>(null);
    const virtualRows = useRef<any>(null);
    const lastTopLog = useRef<string | null>(null);
    const lastCount = useRef<number>(-1);
    const scrollOnLoad = useRef(true);
    const [fetchingOlder, setFetchingOlder] = useState(false);
    const [fetchingNewer, setFetchingNewer] = useState(false);
    const [lastCheckedForNew, setLastCheckedForNew] = useState<string | null>(
        null
    );

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
            setLastCheckedForNew(null);
            setFetchingNewer(true);
            fetchNewer();
        } else if (
            scrollOffset === 0 &&
            fetchOlder &&
            scrollDirection === 'backward'
        ) {
            setFetchingOlder(true);
            fetchOlder();
        }
    };

    // Keep track of the top item so we can keep it in view when more logs are loaded
    useEffect(() => {
        lastCount.current = documents.length;
        lastTopLog.current = documents[0]?._meta.uuid;
    }, [documents]);

    useLayoutEffect(() => {
        if (!fetchingOlder && !fetchingNewer) {
            return;
        }

        if (lastCount.current < documents.length) {
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
                tableScroller.current.scrollToItem(documents.length, 'bottom');
            }
            setFetchingOlder(false);
            setFetchingNewer(false);
            setLastCheckedForNew(null);
        } else if (fetchingNewer && lastCount.current === documents.length) {
            setLastCheckedForNew(new Date().toISOString());
            setFetchingNewer(false);
        }
    }, [documents, fetchingOlder, fetchingNewer]);

    // On load scroll to near the bottom
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (scrollOnLoad?.current && tableScroller?.current) {
            scrollOnLoad.current = false;
            tableScroller.current.scrollToItem(
                documents.length > 1 ? Math.round(documents.length * 0.9) : 1
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
                    <EntityTableHeader
                        columns={columns}
                        enableDivRendering
                        height={35} // This is required for FF to render the body for some reason (Q1 2024)
                    />

                    <LogsTableBody
                        documents={documents}
                        onScroll={onScroll}
                        outerRef={outerRef}
                        tableScroller={tableScroller}
                        virtualRows={virtualRows}
                        loading={loading}
                    />

                    <LogsTableFooter
                        logsCount={documents.length}
                        lastCheckedForNew={lastCheckedForNew}
                    />
                </Table>
            </TableContainer>
            {fetchingNewer ? <LinearProgress /> : null}
        </>
    );
}

export default LogsTable;
