import { Box, Table, TableContainer } from '@mui/material';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useToggle } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { hasLength } from 'utils/misc-utils';
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
    // fetchOlder,
    loading,
}: Props) {
    const intl = useIntl();
    const columns = useLogColumns();

    const tableScroller = useRef<any>(null);
    const [shouldScroll, toggleSchouldScroll] = useToggle(true);
    // const { stayScrolled } = useStayScrolled(tableScroller);

    // const { y } = useScroll(tableScroller);

    // useEffect(() => {
    //     if (fetchOlder && y === 0) {
    //         fetchOlder();
    //     } else {
    //         // Math.abs(tableScroller.scrollHeight - (tableScroller.scrollTop + tableScroller.clientHeight)) <= 1
    //         // eslint-disable-next-line no-lonely-if
    //         if (y > 10000) {
    //             fetchNewer();
    //         }
    //     }
    // }, [fetchNewer, fetchOlder, y]);

    useLayoutEffect(() => {
        if (hasLength(documents) && shouldScroll) {
            toggleSchouldScroll();
            tableScroller.current.scrollToItem(20);
        }
    }, [documents, shouldScroll, toggleSchouldScroll]);

    const renderRow = useCallback(
        (props: ListChildComponentProps) => {
            console.log('rendering row', { props });
            const { index, style } = props;

            return <Row row={documents[index]} style={style} />;
        },
        [documents]
    );

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

                            <EntityTableBody
                                columns={columns}
                                noExistingDataContentIds={{
                                    header: 'ops.logsTable.emptyTableDefault.header',
                                    message:
                                        'ops.logsTable.emptyTableDefault.message',
                                    disableDoclink: true,
                                }}
                                CustomBody={() => {
                                    return (
                                        <FixedSizeList
                                            ref={tableScroller}
                                            height={height}
                                            width={width}
                                            itemSize={55}
                                            itemCount={documents.length}
                                            overscanCount={10}
                                        >
                                            {renderRow}
                                        </FixedSizeList>
                                    );
                                }}
                                tableState={
                                    documents.length > 0
                                        ? { status: TableStatuses.DATA_FETCHED }
                                        : {
                                              status: TableStatuses.NO_EXISTING_DATA,
                                          }
                                }
                                loading={Boolean(loading)}
                                rows={documents}
                            />
                        </Table>
                    </TableContainer>
                );
            }}
        </AutoSizer>
    );
}

export default VirtualizedLogsTable;
