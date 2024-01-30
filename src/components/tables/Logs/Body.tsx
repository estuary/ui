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
                (expandedHeights.current.get(documents[rowIndex]._meta.uuid) ??
                    0) + DEFAULT_ROW_HEIGHT
            );
        },
        [documents]
    );

    const expandRow = useCallback(
        (index: number, uuid: string, height: number) => {
            console.log('expandRow', { uuid, height });

            if (
                height <= 0 ||
                height === DEFAULT_ROW_HEIGHT ||
                height === DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS
            ) {
                expandedHeights.current.delete(uuid);
            } else {
                expandedHeights.current.set(uuid, height);
            }

            tableScroller.current.resetAfterIndex(index);
        },
        [tableScroller]
    );

    const renderRow = useCallback(
        ({ index, style, data }: ListChildComponentProps) => {
            return (
                <LogsTableRow
                    row={data[index]}
                    style={style}
                    rowExpanded={(height) =>
                        expandRow(index, data[index]._meta.uuid, height)
                    }
                />
            );
        },
        [expandRow]
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
                                itemData={documents}
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
