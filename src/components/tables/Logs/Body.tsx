import type { MutableRefObject } from 'react';
import type { ListChildComponentProps } from 'react-window';
import type { OpsLogFlowDocument } from 'src/types';

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import { TableBody } from '@mui/material';

import { isEmpty } from 'lodash';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';

import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import { LogsTableRow } from 'src/components/tables/Logs/Row';
import {
    DEFAULT_ROW_HEIGHT,
    DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS,
    UUID_NEWEST_LOG,
    UUID_OLDEST_LOG,
    VIRTUAL_TABLE_BODY_PADDING,
    WAITING_ROW_HEIGHT,
} from 'src/components/tables/Logs/shared';
import useLogColumns from 'src/components/tables/Logs/useLogColumns';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';
import { TableStatuses } from 'src/types';

interface Props {
    outerRef: MutableRefObject<HTMLDivElement | undefined>;
    tableScroller: (node?: any) => VariableSizeList | undefined;
    virtualRows: MutableRefObject<HTMLDivElement | undefined>;
}

function LogsTableBody({ outerRef, tableScroller, virtualRows }: Props) {
    const columns = useLogColumns();

    const openRows = useRef<Map<string, boolean>>(new Map());
    const expandedHeights = useRef<Map<string, number>>(new Map());

    const [hydrated, documents, networkFailed, noData] =
        useJournalDataLogsStore((state) => [
            state.hydrate,
            state.documents,
            state.networkFailed,
            state.noData,
        ]);

    // Keeping this outside the store so we don't have to filter them out everytime
    //  we need to add new docs to the list
    const itemData = useMemo<OpsLogFlowDocument[] | null>(() => {
        if (documents && documents.length > 0) {
            logRocketEvent(CustomEvents.LOGS_DOCUMENT_COUNT, {
                count: documents.length,
            });

            return [
                {
                    _meta: {
                        uuid: UUID_OLDEST_LOG,
                    },
                    level: 'ui_waiting',
                    message: '',
                    ts: '',
                },
                ...documents,
                {
                    _meta: {
                        uuid: UUID_NEWEST_LOG,
                    },
                    level: 'ui_waiting',
                    message: '',
                    ts: '',
                },
            ];
        }

        return null;
    }, [documents]);

    const renderRow = useCallback(
        ({ data, index, style }: ListChildComponentProps) => {
            const row = data[index];
            return (
                <LogsTableRow
                    row={row}
                    style={style}
                    rowExpanded={(uuid, height) => {
                        expandedHeights.current.set(uuid, height);
                        tableScroller()?.resetAfterIndex(index);
                    }}
                    rowOpened={(uuid, isOpen) =>
                        openRows.current.set(uuid, isOpen)
                    }
                    renderOpen={Boolean(openRows.current.get(row._meta.uuid))}
                />
            );
        },
        [tableScroller]
    );

    // TODO (Logs)
    // https://github.com/bvaughn/react-window/issues/445
    // If we are getting new logs in we need to clear the cache due to
    //  react-window bug mentioned up above
    useLayoutEffect(() => {
        tableScroller()?.resetAfterIndex(0);
    }, [itemData, tableScroller]);

    if (itemData && itemData.length > 0) {
        return (
            <TableBody component="div">
                <AutoSizer>
                    {({ width, height }: AutoSizer['state']) => {
                        return (
                            <VariableSizeList
                                innerRef={virtualRows}
                                outerRef={outerRef}
                                ref={tableScroller}
                                estimatedItemSize={DEFAULT_ROW_HEIGHT}
                                height={height}
                                itemCount={itemData.length}
                                itemData={itemData}
                                itemKey={(index, data) => {
                                    return data[index]._meta.uuid;
                                }}
                                itemSize={(index) => {
                                    const row = itemData[index];

                                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                    if (!row) {
                                        return 0;
                                    }

                                    // Due to the intersection observer we need to force a specific height
                                    if (row.level === 'ui_waiting') {
                                        return WAITING_ROW_HEIGHT;
                                    }

                                    const customHeight =
                                        expandedHeights.current.get(
                                            row._meta.uuid
                                        );

                                    return customHeight && customHeight > 0
                                        ? customHeight
                                        : isEmpty(row.fields)
                                          ? DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS
                                          : DEFAULT_ROW_HEIGHT;
                                }}
                                overscanCount={10}
                                style={{
                                    paddingBottom: VIRTUAL_TABLE_BODY_PADDING,
                                    paddingTop: VIRTUAL_TABLE_BODY_PADDING,
                                }}
                                width={width}
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
            columns={[columns[0]]}
            enableDivRendering
            noExistingDataContentIds={{
                header: 'ops.logsTable.emptyTableDefault.header',
                message: 'ops.logsTable.emptyTableDefault.message',
                disableDoclink: true,
            }}
            tableState={{
                status: noData
                    ? TableStatuses.NO_EXISTING_DATA
                    : networkFailed
                      ? TableStatuses.NETWORK_FAILED
                      : TableStatuses.LOADING,
            }}
            loading={!hydrated}
            rows={null}
        />
    );
}

export default LogsTableBody;
