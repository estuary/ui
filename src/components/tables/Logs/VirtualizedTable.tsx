import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
    const [fetchingOlder, setFetchingOlder] = useState(false);

    // const [shouldScroll, toggleSchouldScroll] = useToggle(true);

    const onScroll = ({ scrollOffset, scrollDirection, ...args }: any) => {
        console.log('scroll', args);
        if (
            !fetchingOlder &&
            scrollOffset === 0 &&
            fetchOlder &&
            scrollDirection === 'backward'
        ) {
            console.log('   fetching');
            setFetchingOlder(true);
            fetchOlder();
        }
    };

    useLayoutEffect(() => {
        console.log('docs effect');
        if (fetchingOlder) {
            console.log('   scroll to item', {
                scroller: tableScroller.current,
            });
            setFetchingOlder(false);
            tableScroller.current.scrollToItem(20);
        }
    }, [fetchingOlder]);

    const renderRow = useCallback(
        (props: ListChildComponentProps) => {
            const { index, style } = props;

            return <Row row={documents[index]} style={style} />;
        },
        [documents]
    );

    // Scroll to the bottom on load
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tableScroller?.current) {
            tableScroller.current.scrollToItem(documents.length);
        }
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
