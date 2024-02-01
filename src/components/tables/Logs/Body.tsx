import AutoSizer from 'react-virtualized-auto-sizer';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { TableBody } from '@mui/material';
import { MutableRefObject, useCallback, useRef } from 'react';
import EntityTableBody from '../EntityTable/TableBody';
import {
    DEFAULT_ROW_HEIGHT,
    DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS,
} from './shared';
import useLogColumns from './useLogColumns';
import { LogsTableRow } from './Row';

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
            if (!Boolean(documents[rowIndex].fields)) {
                return DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS;
            }

            return (
                expandedHeights.current.get(documents[rowIndex]._meta.uuid) ??
                DEFAULT_ROW_HEIGHT
            );
        },
        [documents]
    );

    const expandRow = useCallback(
        (index: number, height: number) => {
            if (
                height > 0 ||
                height === DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS ||
                height === DEFAULT_ROW_HEIGHT
            ) {
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
        ({ data, index, style }: ListChildComponentProps) => {
            console.log('renderRow');
            return (
                <LogsTableRow
                    row={data[index]}
                    style={style}
                    rowExpanded={(height) => expandRow(index, height)}
                />
            );
        },
        [expandRow]
    );

    if (documents.length > 0) {
        return (
            <TableBody component="div">
                1
                <AutoSizer>
                    {({ width, height }: AutoSizer['state']) => {
                        console.log('{ width, height }', { width, height });
                        return (
                            <VariableSizeList
                                ref={tableScroller}
                                outerRef={outerRef}
                                innerRef={virtualRows}
                                height={height}
                                width={width}
                                itemData={documents}
                                itemSize={getItemSize}
                                estimatedItemSize={DEFAULT_ROW_HEIGHT}
                                itemCount={documents.length}
                                overscanCount={15}
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
            enableDivRendering
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
