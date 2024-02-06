import AutoSizer from 'react-virtualized-auto-sizer';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { OpsLogFlowDocument, TableStatuses } from 'types';
import { TableBody } from '@mui/material';
import { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import { isEmpty } from 'lodash';
import {
    useJournalDataLogsStore_documents,
    useJournalDataLogsStore_hydrated,
    useJournalDataLogsStore_networkFailed,
    useJournalDataLogsStore_noData,
} from 'stores/JournalData/Logs/hooks';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import EntityTableBody from '../EntityTable/TableBody';
import {
    DEFAULT_ROW_HEIGHT,
    DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS,
    UUID_NEWEST_LOG,
    UUID_OLDEST_LOG,
} from './shared';
import useLogColumns from './useLogColumns';
import { LogsTableRow } from './Row';

interface Props {
    outerRef: MutableRefObject<any>;
    tableScroller: (node?: any) => VariableSizeList | null;
    virtualRows: MutableRefObject<any>;
}

function LogsTableBody({ outerRef, tableScroller, virtualRows }: Props) {
    const columns = useLogColumns();

    const openRows = useRef<Map<string, boolean>>(new Map());
    const expandedHeights = useRef<Map<string, number>>(new Map());

    const hydrated = useJournalDataLogsStore_hydrated();
    const documents = useJournalDataLogsStore_documents();
    const networkFailed = useJournalDataLogsStore_networkFailed();
    const noData = useJournalDataLogsStore_noData();

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
                    level: 'waiting',
                    message: '',
                    ts: '',
                },
                ...documents,
                {
                    _meta: {
                        uuid: UUID_NEWEST_LOG,
                    },
                    level: 'waiting',
                    message: '',
                    ts: '',
                },
            ];
        }

        return null;
    }, [documents]);

    const getItemSize = useCallback(
        (rowIndex: number) => {
            const row = itemData?.[rowIndex];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!row) {
                return 0;
            }

            const customHeight = expandedHeights.current.get(row._meta.uuid);

            return customHeight && customHeight > 0
                ? customHeight
                : isEmpty(row.fields)
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

            tableScroller()?.resetAfterIndex(index);
        },
        [tableScroller]
    );

    const renderRow = useCallback(
        ({ data, index, style }: ListChildComponentProps) => {
            const row = data[index];
            const uuid = row._meta.uuid;
            return (
                <LogsTableRow
                    row={row}
                    style={style}
                    rowExpanded={(height) =>
                        updateRowHeight(index, uuid, height)
                    }
                    rowOpened={(isOpen) => openRow(uuid, isOpen)}
                    renderOpen={Boolean(openRows.current.get(uuid))}
                />
            );
        },
        [openRow, updateRowHeight]
    );

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
                                itemSize={getItemSize}
                                overscanCount={10}
                                style={{ paddingBottom: 10, paddingTop: 10 }}
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
            rows={itemData}
        />
    );
}

export default LogsTableBody;
