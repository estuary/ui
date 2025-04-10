import type { CollectionSelectorListProps } from 'src/components/collection/Selector/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';

import {
    Box,
    Popper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import {
    gridPaginatedVisibleSortedGridRowIdsSelector,
    useGridApiRef,
} from '@mui/x-data-grid';

import { debounce, isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import { usePrevious, useUnmount } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import CollectionSelectorHeaderName from 'src/components/collection/Selector/List/Header/Name';
import CollectionSelectorHeaderRemove from 'src/components/collection/Selector/List/Header/Remove';
import CollectionSelectorHeaderToggle from 'src/components/collection/Selector/List/Header/Toggle';
import {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_TOGGLE_COL,
    COLLECTION_SELECTOR_UUID_COL,
    getCollectionSelector,
} from 'src/components/collection/Selector/List/shared';
import SelectorEmpty from 'src/components/editor/Bindings/SelectorEmpty';
import AlertBox from 'src/components/shared/AlertBox';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useEntityType } from 'src/context/EntityContext';
import { defaultOutline_hovered } from 'src/context/Theme';
import {
    useBinding_currentBindingUUID,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { hasLength, stripPathing } from 'src/utils/misc-utils';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

const cellClass_noPadding = 'estuary-datagrid--cell--no-padding';

const DEFAULT_ROW_HEIGHT = 50;

function CollectionSelectorList({
    disableActions,
    header,
    height,
    removeCollections,
    toggleCollections,
    renderers,
    setCurrentBinding,
}: CollectionSelectorListProps) {
    const apiRef = useGridApiRef();

    const entityType = useEntityType();
    const isCapture = entityType === 'capture';

    const notificationAnchorEl = useRef<any | null>();
    const popperTimeout = useRef<number | null>(null);
    const hackyTimeout = useRef<number | null>(null);
    const intl = useIntl();
    const collectionsLabel = useConstant(
        () =>
            header ??
            intl.formatMessage({
                id: 'workflows.collectionSelector.label.listHeader',
            })
    );
    const [filterValue, setFilterValue] = useState('');
    const previousFilterValue = usePrevious(filterValue);

    const [notificationMessage, setNotificationMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    // Binding Store
    const currentBindingUUID = useBinding_currentBindingUUID();
    const resourceConfigs = useBinding_resourceConfigs();

    // Form State Store
    const formStatus = useFormStateStore_status();

    const selectionEnabled = Boolean(
        currentBindingUUID &&
            setCurrentBinding &&
            formStatus !== FormStatus.UPDATING
    );

    // // We use mui`s selection model to store which collection was clicked on to display it
    // const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    //     []
    // );
    // useEffect(() => {
    //     // TODO (keep current binding) we need to handle filtering better.
    //     //  Waiting on us to handle client side filtering on our own first.
    //     //  After that we should make sure the thing we're selecting is actually
    //     //  visible with the filters enabled.
    //     if (currentBindingUUID) setSelectionModel([currentBindingUUID]);
    // }, [currentBindingUUID]);

    const rows = useMemo(() => {
        // If we have no bindings we can just return an empty array
        if (isEmpty(resourceConfigs)) {
            return [];
        }

        // We have bindings so need to format them in a format that mui
        //  datagrid will handle. At a minimum each object must have an
        //  `id` property.
        return Object.entries(resourceConfigs).map(([bindingUUID, config]) => {
            const collection = config.meta.collectionName;

            return {
                // [COLLECTION_SELECTOR_VISIBLE]: true,
                [COLLECTION_SELECTOR_UUID_COL]: bindingUUID,
                [COLLECTION_SELECTOR_NAME_COL]: collection,
                [COLLECTION_SELECTOR_STRIPPED_PATH_NAME]:
                    stripPathing(collection),
            };
        });
    }, [resourceConfigs]);

    const debouncedFilter = useRef(
        debounce((val) => {
            setFilterValue(val);
        }, QUICK_DEBOUNCE_WAIT)
    );

    const filteredRows = useMemo(() => {
        if (filterValue === '') {
            return null;
        }

        return rows.filter((row) =>
            row[COLLECTION_SELECTOR_NAME_COL].includes(filterValue)
        );
    }, [filterValue, rows]);

    useEffect(() => {
        // Selection disabled
        if (!setCurrentBinding) {
            return;
        }

        if (filteredRows && filteredRows.length > 0) {
            // If we have filtered values then see if this is a first search and default
            if (previousFilterValue === '') {
                setCurrentBinding(
                    filteredRows[0][COLLECTION_SELECTOR_UUID_COL]
                );
            } else {
                if (
                    filteredRows.find(
                        (filteredRow) =>
                            filteredRow[COLLECTION_SELECTOR_UUID_COL] ===
                            currentBindingUUID
                    )
                ) {
                    return;
                } else {
                    setCurrentBinding(
                        filteredRows[0][COLLECTION_SELECTOR_UUID_COL]
                    );
                }
            }

            return;
        }

        if (previousFilterValue !== '' && Boolean(rows[0])) {
            setCurrentBinding(rows[0][COLLECTION_SELECTOR_UUID_COL]);
        }
    }, [
        currentBindingUUID,
        filterValue,
        filteredRows,
        previousFilterValue,
        rows,
        setCurrentBinding,
    ]);

    const rowsEmpty = useMemo(() => !hasLength(rows), [rows]);

    const disable = useMemo(
        () => rowsEmpty || disableActions,
        [disableActions, rowsEmpty]
    );

    const showPopper = useCallback((target: any, message: string) => {
        setNotificationMessage(message);
        setShowNotification(true);

        if (popperTimeout.current) clearTimeout(popperTimeout.current);
        popperTimeout.current = window.setTimeout(() => {
            setShowNotification(false);
        }, 1000);
    }, []);

    const collectionSelector = useMemo(
        () => getCollectionSelector(!filteredRows && isCapture),
        [filteredRows, isCapture]
    );

    const columns = useMemo(() => {
        const response: any[] = [
            {
                cellClassName: cellClass_noPadding,
                field: collectionSelector,
                fullWidth: true,
                headerName: collectionsLabel,
                renderHeader: (...args: any) => {
                    console.log('renderHeader.collection name', ...args);

                    return (
                        <CollectionSelectorHeaderName
                            disabled={disable}
                            inputValue={filterValue}
                            itemType={collectionsLabel}
                            onChange={(value) => {
                                debouncedFilter.current(value);
                            }}
                        />
                    );
                },
                renderCell: (params: any) =>
                    renderers.cell.name(params, filterValue),
            },
        ];

        if (toggleCollections) {
            response.unshift({
                cellClassName: cellClass_noPadding,
                headerClassName: cellClass_noPadding,
                field: COLLECTION_SELECTOR_TOGGLE_COL,
                minWidth: 110,
                maxWidth: 125,
                renderCell: renderers.cell.toggle,
                renderHeader: () => (
                    <CollectionSelectorHeaderToggle
                        disabled={disable}
                        itemType={collectionsLabel}
                        onClick={(event, value, scope) => {
                            const count = toggleCollections(
                                scope === 'page'
                                    ? gridPaginatedVisibleSortedGridRowIdsSelector(
                                          apiRef.current.state,
                                          apiRef.current.instanceId
                                      )
                                    : null,
                                value
                            );

                            showPopper(
                                event.currentTarget,
                                intl.formatMessage(
                                    {
                                        id: value
                                            ? 'workflows.collectionSelector.notifications.toggle.disable'
                                            : 'workflows.collectionSelector.notifications.toggle.enable',
                                    },
                                    {
                                        count: `${count}`,
                                        itemType: collectionsLabel,
                                    }
                                )
                            );
                        }}
                    />
                ),
            });
        }

        if (removeCollections) {
            response.push({
                field: 'remove',
                minWidth: 52,
                maxWidth: 52,
                renderCell: renderers.cell.remove,
                renderHeader: () => (
                    <CollectionSelectorHeaderRemove
                        disabled={disable}
                        itemType={collectionsLabel}
                        onClick={(event) => {
                            const filteredCollections =
                                gridPaginatedVisibleSortedGridRowIdsSelector(
                                    apiRef.current.state,
                                    apiRef.current.instanceId
                                );

                            if (hasLength(filteredCollections)) {
                                removeCollections(filteredCollections);
                                setFilterValue('');

                                showPopper(
                                    event.currentTarget,
                                    intl.formatMessage(
                                        {
                                            id: 'workflows.collectionSelector.notifications.remove',
                                        },
                                        {
                                            count: filteredCollections.length,
                                            itemType: collectionsLabel,
                                        }
                                    )
                                );
                            }
                        }}
                    />
                ),
            });
        }
        return response;
    }, [
        apiRef,
        collectionSelector,
        collectionsLabel,
        disable,
        filterValue,
        intl,
        removeCollections,
        renderers.cell,
        showPopper,
        toggleCollections,
    ]);

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
        if (popperTimeout.current) clearTimeout(popperTimeout.current);
    });

    return (
        <Box sx={{ height: height ?? 480 }} ref={notificationAnchorEl}>
            <Popper
                anchorEl={notificationAnchorEl.current}
                open={Boolean(showNotification && notificationAnchorEl.current)}
                placement="top"
            >
                <AlertBox hideIcon short severity="success" title={null}>
                    {notificationMessage}
                </AlertBox>
            </Popper>
            {rowsEmpty ? (
                <SelectorEmpty />
            ) : (
                <TableContainer
                    component={Box}
                    width="100%"
                    sx={{
                        height: '100%',
                    }}
                >
                    <Table
                        component={Box}
                        sx={{
                            // ...dataGridListStyling,
                            height: '100%',
                            border: 0,
                            [`& .${cellClass_noPadding}`]: { padding: 0 },
                        }}
                        stickyHeader
                    >
                        <EntityTableHeader
                            columns={columns}
                            enableDivRendering
                            height={35} // This is required for FF to render the body for some reason
                        />
                        <TableBody component="div">
                            <AutoSizer>
                                {({ height, width }: AutoSizer['state']) => (
                                    <FixedSizeList
                                        height={height} // Adjust for header height
                                        itemSize={DEFAULT_ROW_HEIGHT} // Row height
                                        width={width}
                                        itemCount={rows.length}
                                        itemData={rows}
                                        itemKey={(index, data) => {
                                            return data[index][
                                                COLLECTION_SELECTOR_UUID_COL
                                            ];
                                        }}
                                    >
                                        {({ index, style, data }) => {
                                            if (!data) {
                                                // eslint-disable-next-line react/jsx-no-useless-fragment
                                                return <></>;
                                            }

                                            console.log('style', style);

                                            const row = data[index];
                                            return (
                                                <TableRow
                                                    key={
                                                        row[
                                                            COLLECTION_SELECTOR_UUID_COL
                                                        ]
                                                    }
                                                    style={style}
                                                    onClick={
                                                        selectionEnabled
                                                            ? () =>
                                                                  setCurrentBinding?.(
                                                                      row[
                                                                          COLLECTION_SELECTOR_UUID_COL
                                                                      ]
                                                                  )
                                                            : undefined
                                                    }
                                                    selected={
                                                        row[
                                                            COLLECTION_SELECTOR_UUID_COL
                                                        ] === currentBindingUUID
                                                    }
                                                    hover={selectionEnabled}
                                                    sx={{
                                                        cursor: selectionEnabled
                                                            ? 'pointer'
                                                            : undefined,
                                                        borderBottomColor: (
                                                            theme
                                                        ) =>
                                                            defaultOutline_hovered[
                                                                theme.palette
                                                                    .mode
                                                            ],
                                                    }}
                                                >
                                                    {columns.map((column) => {
                                                        console.log(
                                                            'column',
                                                            column
                                                        );

                                                        return (
                                                            <TableCell
                                                                key={
                                                                    column.field
                                                                }
                                                                className={
                                                                    column.cellClassName
                                                                }
                                                                style={{
                                                                    height: `${style.height}px`,
                                                                    width: column.fullWidth
                                                                        ? '100%'
                                                                        : undefined,
                                                                    maxWidth:
                                                                        column.maxWidth
                                                                            ? `${column.maxWidth}px`
                                                                            : undefined,
                                                                    minWidth:
                                                                        column.minWidth
                                                                            ? `${column.minWidth}px`
                                                                            : undefined,
                                                                }}
                                                            >
                                                                {column.renderCell
                                                                    ? column.renderCell(
                                                                          {
                                                                              row,
                                                                          },
                                                                          filterValue
                                                                      )
                                                                    : row[
                                                                          column
                                                                              .field
                                                                      ]}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        }}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default CollectionSelectorList;

// <DataGrid
//     apiRef={apiRef}
//     columns={columns}
//     components={{ NoRowsOverlay: SelectorEmpty }}
//     disableColumnMenu
//     disableColumnSelector
//     disableEval
//     disableRowSelectionOnClick={!selectionEnabled}
//     hideFooterPagination={rowsEmpty}
//     hideFooterSelectedRowCount
//     initialState={initialState}
//     rows={filteredRows ?? rows}
//     rowSelectionModel={
//         selectionEnabled ? selectionModel : undefined
//     }
//     sx={{
//         ...dataGridListStyling,
//         border: 0,
//         [`& .${cellClass_noPadding}`]: { padding: 0 },
//     }}
//     onCellClick={({ field, id }) => {
//         if (
//             selectionEnabled &&
//             (field === COLLECTION_SELECTOR_STRIPPED_PATH_NAME ||
//                 field === COLLECTION_SELECTOR_NAME_COL ||
//                 field === COLLECTION_SELECTOR_TOGGLE_COL) &&
//             id !== currentBindingUUID
//         ) {
//             console.log('clearing');
//             // TODO (JSONForms) This is hacky but it works.
//             // It clears out the current binding before switching.
//             //  If a user is typing quickly in a form and then selects a
//             //  different binding VERY quickly it could cause the updates
//             //  to go into the wrong form.
//             setCurrentBinding(null);

//             if (typeof id === 'string') {
//                 hackyTimeout.current = window.setTimeout(() => {
//                     console.log('setting id', id);
//                     setCurrentBinding(id);
//                 });
//             }
//         }
//     }}
// }/>
