import { Box, LinearProgress, Table, TableContainer } from '@mui/material';
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

interface Props {
    documents: OpsLogFlowDocument[];
    fetchNewer: () => void;
    fetchOlder?: () => void;
    loading?: boolean;
}

const DEFAULT_ROW_HEIGHT = 55;

function LogsTable({
    documents,
    // fetchNewer,
    fetchOlder,
    loading,
}: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const tableScroller = useRef<any>(null);
    const lastTopLog = useRef<string | null>(null);
    const lastCount = useRef<number>(-1);
    const expandedHeights = useRef<Map<string, number>>(new Map());
    const [fetchingOlder, setFetchingOlder] = useState(false);

    const onScroll = ({ scrollOffset, scrollDirection }: any) => {
        if (
            !fetchingOlder &&
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
        if (!fetchingOlder) {
            return;
        }

        if (lastCount.current < documents.length) {
            setFetchingOlder(false);
            tableScroller.current.scrollToItem(
                findIndex(
                    documents,
                    (document) => document._meta.uuid === lastTopLog.current
                ),
                'top'
            );
        }

        if (lastCount.current === documents.length) {
            console.log('fetching older and list length did not change');
        }
    }, [documents, fetchingOlder]);

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
        (props: ListChildComponentProps) => {
            const { index, style } = props;
            const row = documents[index];

            return (
                <Row
                    row={row}
                    style={style}
                    renderExpanded={Boolean(
                        expandedHeights.current.get(row._meta.uuid)
                    )}
                    rowExpanded={(height) => expandRow(index, height)}
                />
            );
        },
        [documents, expandRow]
    );

    // Scroll to the bottom on load NOT WORKING
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tableScroller?.current) {
            tableScroller.current.scrollToItem(documents.length);
        }
        // We only care about then the scroll ref is set so we can scroll to the bottom
        // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unnecessary-condition
    }, [tableScroller?.current]);

    return (
        <AutoSizer style={{ height: '500px', width: '100%' }}>
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

                            {loading ? <LinearProgress /> : null}

                            {documents.length > 0 ? (
                                <VariableSizeList
                                    ref={tableScroller}
                                    height={height}
                                    width={width}
                                    itemSize={(rowIndex) => {
                                        return (
                                            (expandedHeights.current.get(
                                                documents[rowIndex]._meta.uuid
                                            ) ?? 0) + DEFAULT_ROW_HEIGHT
                                        );
                                    }}
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
                        </Table>
                    </TableContainer>
                );
            }}
        </AutoSizer>
    );
}

export default LogsTable;
