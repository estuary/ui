import { Box, Table, TableContainer } from '@mui/material';
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
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { Row } from './Rows';
import useLogColumns from './useLogColumns';

interface Props {
    documents: OpsLogFlowDocument[];
    fetchNewer: () => void;
    fetchOlder?: () => void;
    loading?: boolean;
}

function VirtualizedLogsTable({
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
    const [fetchingOlder, setFetchingOlder] = useState(false);
    // const [shouldScroll, toggleSchouldScroll] = useToggle(true);

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
        if (lastCount.current < documents.length && fetchingOlder) {
            setFetchingOlder(false);
            tableScroller.current.scrollToItem(
                findIndex(
                    documents,
                    (document) => document._meta.uuid === lastTopLog.current
                ),
                'top'
            );
        }
    }, [documents, fetchingOlder]);

    const renderRow = useCallback(
        (props: ListChildComponentProps) => {
            const { index, style } = props;

            return <Row row={documents[index]} style={style} />;
        },
        [documents]
    );

    // Scroll to the bottom on load NOT WORKING
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tableScroller?.current) {
            tableScroller.current.scrollToItem(documents.length);
        }
        // We only care about then the scroll ref is set so we can scroll to the bottom
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableScroller]);

    return (
        <AutoSizer style={{ height: '500px', width: '100%' }}>
            {({ width, height }: AutoSizer['state']) => {
                return (
                    <TableContainer
                        component={Box}
                        height={height}
                        width={width}
                        sx={{ overflow: 'hidden' }}
                        // ref={tableScroller}
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

                            {documents.length > 0 ? (
                                <FixedSizeList
                                    ref={tableScroller}
                                    height={height}
                                    width={width}
                                    itemSize={55}
                                    itemCount={documents.length}
                                    overscanCount={10}
                                    onScroll={onScroll}
                                    style={{
                                        paddingBottom: 20,
                                        paddingTop: 20,
                                    }}
                                >
                                    {renderRow}
                                </FixedSizeList>
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

export default VirtualizedLogsTable;
