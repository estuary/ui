import AutoSizer from 'react-virtualized-auto-sizer';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { TableBody } from '@mui/material';
import { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import EntityTableBody from '../EntityTable/TableBody';
import {
    DEFAULT_ROW_HEIGHT,
    DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS,
    UUID_NEWEST_LOG,
    UUID_OLDEST_LOG,
    UUID_START_OF_LOGS,
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
    const intl = useIntl();
    const columns = useLogColumns();

    const openRows = useRef<Map<string, boolean>>(new Map());
    const expandedHeights = useRef<Map<string, number>>(new Map());

    const itemData = useMemo(() => {
        if (documents.length > 0) {
            const response = [
                ...documents,
                {
                    _meta: {
                        uuid: UUID_NEWEST_LOG,
                    },
                    level: 'waiting',
                    message: intl.formatMessage({
                        id: 'ops.logsTable.waitingForNewLogs',
                    }),
                    ts: '',
                },
            ];

            const oldestLogLine = {
                _meta: {
                    uuid: UUID_OLDEST_LOG,
                },
                level: 'waiting',
                message: intl.formatMessage({
                    id: 'ops.logsTable.waitingForOldLogs',
                }),
                ts: '',
            };

            // If we're not at the start add a line to show waiting for older logs
            if (response[0]._meta.uuid !== UUID_START_OF_LOGS) {
                response.unshift(oldestLogLine);
            }

            return response;
        }

        return [];
    }, [documents, intl]);

    const getItemSize = useCallback(
        (rowIndex: number) => {
            const row = itemData[rowIndex];
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!row) {
                return 0;
            }

            return expandedHeights.current.get(row._meta.uuid) ??
                isEmpty(row.fields)
                ? DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS
                : DEFAULT_ROW_HEIGHT;
        },
        [itemData]
    );

    const openRow = useCallback((uuid: string, isOpen: boolean) => {
        if (isOpen) {
            openRows.current.set(uuid, isOpen);
        } else {
            openRows.current.delete(uuid);
        }
    }, []);

    const updateRowHeight = useCallback(
        (index: number, uuid: string, height: number) => {
            if (
                height > 0 ||
                height === DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS ||
                height === DEFAULT_ROW_HEIGHT
            ) {
                expandedHeights.current.set(uuid, height);
            } else {
                expandedHeights.current.delete(uuid);
            }

            tableScroller.current.resetAfterIndex(index);
        },
        [tableScroller]
    );

    const renderRow = useCallback(
        ({ data, index, style }: ListChildComponentProps) => {
            return (
                <LogsTableRow
                    row={data[index]}
                    style={style}
                    rowExpanded={(height) =>
                        updateRowHeight(index, data[index]._meta.uuid, height)
                    }
                    rowOpened={(isOpen) =>
                        openRow(data[index]._meta.uuid, isOpen)
                    }
                    renderOpen={Boolean(
                        openRows.current.get(data[index]._meta.uuid)
                    )}
                />
            );
        },
        [openRow, updateRowHeight]
    );

    if (itemData.length > 0) {
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
                                itemData={itemData}
                                itemSize={getItemSize}
                                estimatedItemSize={DEFAULT_ROW_HEIGHT}
                                itemCount={itemData.length}
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
                itemData.length > 0
                    ? {
                          status: TableStatuses.DATA_FETCHED,
                      }
                    : {
                          status: TableStatuses.NO_EXISTING_DATA,
                      }
            }
            loading={Boolean(loading)}
            rows={itemData}
        />
    );
}

export default LogsTableBody;
