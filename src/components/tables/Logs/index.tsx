import {
    Box,
    LinearProgress,
    Table,
    TableContainer,
    TableFooter,
    TableRow,
    Typography,
} from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { findIndex } from 'lodash';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { useIntl } from 'react-intl';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { Row } from './Rows';
import useLogColumns from './useLogColumns';
import { DEFAULT_ROW_HEIGHT } from './shared';

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
    const expandedHeights = useRef<Map<string, number>>(new Map());
    const scrollOnLoad = useRef(true);
    const [fetchingOlder, setFetchingOlder] = useState(false);
    const [fetchingNewer, setFetchingNewer] = useState(false);
    const [hadNothingNew, setHadNothingNew] = useState(false);

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
        }

        if (lastCount.current === documents.length) {
            console.log('nothing new came in');
            setHadNothingNew(true);
        }
    }, [documents, fetchingOlder, fetchingNewer]);

    const expandRow = useCallback(
        (index: number, height: number) => {
            if (height > 0) {
                expandedHeights.current.set(
                    documents[index]._meta.uuid,
                    height
                );
            } else {
                expandedHeights.current.delete(documents[index]._meta.uuid);
            }

            tableScroller.current.resetAfterIndex(index);
        },
        [documents]
    );

    const renderRow = useCallback(
        ({ index, style }: ListChildComponentProps) => {
            return (
                <Row
                    row={documents[index]}
                    style={style}
                    lastRow={index === documents.length - 1}
                    rowExpanded={(height) => expandRow(index, height)}
                />
            );
        },
        [documents, expandRow]
    );

    const getItemSize = useCallback(
        (rowIndex: number) => {
            return (
                (expandedHeights.current.get(documents[rowIndex]._meta.uuid) ??
                    0) + DEFAULT_ROW_HEIGHT
            );
        },
        [documents]
    );

    // On load scroll to near the bottom
    useLayoutEffect(() => {
        console.log('useLayoutEffect');
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

    console.log('state+', { fetchingNewer, fetchingOlder, loading });

    return (
        <AutoSizer style={{ height: '550px', width: '100%' }}>
            {({ width, height }: AutoSizer['state']) => {
                return (
                    <TableContainer
                        component={Box}
                        height={height}
                        width={width}
                        sx={{ overflow: 'hidden' }}
                    >
                        <Table
                            aria-label={intl.formatMessage({
                                id: 'entityTable.title',
                            })}
                            component={Box}
                            size="small"
                            stickyHeader
                            sx={{ minWidth: 250 }}
                        >
                            <EntityTableHeader
                                columns={columns}
                                enableDivRendering
                            />

                            {fetchingOlder ? <LinearProgress /> : null}

                            {documents.length > 0 ? (
                                <VariableSizeList
                                    ref={tableScroller}
                                    outerRef={outerRef}
                                    innerRef={virtualRows}
                                    height={height - DEFAULT_ROW_HEIGHT}
                                    width={width}
                                    itemSize={getItemSize}
                                    estimatedItemSize={DEFAULT_ROW_HEIGHT}
                                    itemCount={documents.length}
                                    overscanCount={10}
                                    onScroll={onScroll}
                                    style={{
                                        paddingBottom: 10,
                                        paddingTop: 10,
                                    }}
                                >
                                    {renderRow}
                                </VariableSizeList>
                            ) : (
                                <EntityTableBody
                                    columns={columns}
                                    noExistingDataContentIds={{
                                        header: 'ops.logsTable.emptyTableDefault.header',
                                        message:
                                            'ops.logsTable.emptyTableDefault.message',
                                        disableDoclink: true,
                                    }}
                                    tableState={
                                        documents.length > 0
                                            ? {
                                                  status: TableStatuses.DATA_FETCHED,
                                              }
                                            : {
                                                  status: TableStatuses.NO_EXISTING_DATA,
                                              }
                                    }
                                    loading={Boolean(loading)}
                                    rows={documents}
                                />
                            )}

                            {fetchingNewer ? <LinearProgress /> : null}

                            <TableFooter component="div">
                                <TableRow
                                    component="div"
                                    // sx={{ ...tableHeaderFooterSx }}
                                >
                                    {hadNothingNew ? (
                                        <Typography>
                                            No new logs to display
                                        </Typography>
                                    ) : null}
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                );
            }}
        </AutoSizer>
    );
}

export default LogsTable;
