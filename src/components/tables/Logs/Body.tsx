import AutoSizer from 'react-virtualized-auto-sizer';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { TableBody } from '@mui/material';
import { MutableRefObject, useCallback, useRef } from 'react';
import EntityTableBody from '../EntityTable/TableBody';
import { DEFAULT_ROW_HEIGHT } from './shared';
import { Row } from './Rows';
import useLogColumns from './useLogColumns';

interface Props {
    documents: OpsLogFlowDocument[];
    onScroll: any;
    outerRef: MutableRefObject<any>;
    tableScroller: MutableRefObject<any>;
    virtualRows: MutableRefObject<any>;
    loading?: boolean;
}

function LogsTableBody({
    documents,
    outerRef,
    onScroll,
    tableScroller,
    virtualRows,
    loading,
}: Props) {
    const columns = useLogColumns();

    const expandedHeights = useRef<Map<string, number>>(new Map());

    const getItemSize = useCallback(
        (rowIndex: number) => {
            return (
                (expandedHeights.current.get(documents[rowIndex]._meta.uuid) ??
                    0) + DEFAULT_ROW_HEIGHT
            );
        },
        [documents]
    );

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
        [documents, tableScroller]
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

    if (documents.length > 0) {
        return (
            <TableBody component="div">
                <AutoSizer>
                    {({ width, height }: AutoSizer['state']) => {
                        return (
                            <VariableSizeList
                                ref={tableScroller}
                                outerRef={outerRef}
                                innerRef={virtualRows}
                                height={height}
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
                        );
                    }}
                </AutoSizer>
            </TableBody>
        );
    }

    return (
        <EntityTableBody
            columns={columns}
            noExistingDataContentIds={{
                header: 'ops.logsTable.emptyTableDefault.header',
                message: 'ops.logsTable.emptyTableDefault.message',
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
    );
}

export default LogsTableBody;
