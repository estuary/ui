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
    TableFooter,
    TableRow,
} from '@mui/material';

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
import AlertBox from 'src/components/shared/AlertBox';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useEntityType } from 'src/context/EntityContext';
import { truncateTextSx } from 'src/context/Theme';
import { useReactWindowScrollbarGap } from 'src/hooks/useReactWindowScrollbarGap';
import {
    useBinding_currentBindingUUID,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { stripPathing } from 'src/utils/misc-utils';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

const DEFAULT_ROW_HEIGHT = 50;

function CollectionSelectorList({
    disableActions,
    header,
    foo,
    setCurrentBinding,
}: CollectionSelectorListProps) {
    const entityType = useEntityType();
    const isCapture = entityType === 'capture';

    const scrollingElementRef = useRef<FixedSizeList | null>(null);
    const virtualRows = useRef<any | null>(null);
    const tableScroller = useRef<any | null>(null);

    const { scrollGap, scrollingElementCallback } =
        useReactWindowScrollbarGap(tableScroller);

    const notificationAnchorEl = useRef<any | null>(null);
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

    const mappedResourceConfigs = useMemo(() => {
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
                [COLLECTION_SELECTOR_UUID_COL]: bindingUUID,
                [COLLECTION_SELECTOR_NAME_COL]: collection,
                [COLLECTION_SELECTOR_STRIPPED_PATH_NAME]:
                    stripPathing(collection),
            };
        });
    }, [resourceConfigs]);

    useEffect(() => {
        console.log('resourceConfigs changed', resourceConfigs);
    }, [resourceConfigs]);

    useEffect(() => {
        console.log('mappedResourceConfigs changed', mappedResourceConfigs);
    }, [mappedResourceConfigs]);

    const debouncedFilter = useRef(
        debounce((val) => {
            setFilterValue(val);
        }, QUICK_DEBOUNCE_WAIT)
    );

    const filteredRows = useMemo(() => {
        if (filterValue === '') {
            return mappedResourceConfigs;
        }

        return mappedResourceConfigs.filter((row) =>
            row[COLLECTION_SELECTOR_NAME_COL].includes(filterValue)
        );
    }, [filterValue, mappedResourceConfigs]);

    useEffect(() => {
        // Selection disabled
        if (!selectionEnabled || !setCurrentBinding) {
            return;
        }

        if (filterValue !== '') {
            // If we have filtered values then see if this is a first search and default
            if (previousFilterValue === '') {
                setCurrentBinding(
                    filteredRows[0]?.[COLLECTION_SELECTOR_UUID_COL]
                );
            } else {
                // If the current binding is still in the filtered down list
                //  go ahead and leave it selected
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
                        filteredRows[0]?.[COLLECTION_SELECTOR_UUID_COL]
                    );
                }
            }

            return;
        }

        if (previousFilterValue !== '' && Boolean(mappedResourceConfigs[0])) {
            setCurrentBinding(
                mappedResourceConfigs[0]?.[COLLECTION_SELECTOR_UUID_COL]
            );
        }
    }, [
        currentBindingUUID,
        filterValue,
        filteredRows,
        mappedResourceConfigs,
        previousFilterValue,
        selectionEnabled,
        setCurrentBinding,
    ]);

    const resourceConfigsEmpty = useMemo(
        () => mappedResourceConfigs.length <= 0,
        [mappedResourceConfigs]
    );
    const rowsEmpty = useMemo(() => filteredRows.length <= 0, [filteredRows]);

    const disable = useMemo(
        () => resourceConfigsEmpty || disableActions,
        [disableActions, resourceConfigsEmpty]
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
        () =>
            getCollectionSelector(
                Boolean(filterValue && filterValue.length > 0) && isCapture
            ),
        [filterValue, isCapture]
    );

    const columns = useMemo(() => {
        const response: any[] = [
            {
                field: collectionSelector,
                headerName: collectionsLabel,
                renderFooHeader: () => {
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
                    foo.name.cellRenderer(params, filterValue),
            },
        ];

        if (foo.toggle) {
            response.unshift({
                field: COLLECTION_SELECTOR_TOGGLE_COL,
                renderCell: foo.toggle.cellRenderer,
                renderFooHeader: () => (
                    <CollectionSelectorHeaderToggle
                        disabled={disable || rowsEmpty}
                        itemType={collectionsLabel}
                        onClick={(event, value, scope) => {
                            const count = foo.toggle?.handler?.(
                                filteredRows.map((datum) => {
                                    return datum[COLLECTION_SELECTOR_UUID_COL];
                                }),
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

        if (foo.remove) {
            response.push({
                align: 'right',
                field: 'remove',
                preventSelect: true,
                renderCell: foo.remove.cellRenderer,
                renderFooHeader: () => (
                    <CollectionSelectorHeaderRemove
                        disabled={disable || rowsEmpty}
                        itemType={collectionsLabel}
                        onClick={(event) => {
                            if (filteredRows && filteredRows.length > 0) {
                                foo.remove?.handler?.(
                                    filteredRows.map((datum) => {
                                        return datum[
                                            COLLECTION_SELECTOR_UUID_COL
                                        ];
                                    })
                                );
                                setFilterValue('');

                                showPopper(
                                    event.currentTarget,
                                    intl.formatMessage(
                                        {
                                            id: 'workflows.collectionSelector.notifications.remove',
                                        },
                                        {
                                            count: filteredRows.length,
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
        collectionSelector,
        collectionsLabel,
        disable,
        filterValue,
        filteredRows,
        foo.name,
        foo.remove,
        foo.toggle,
        intl,
        rowsEmpty,
        showPopper,
    ]);

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
        if (popperTimeout.current) clearTimeout(popperTimeout.current);
    });

    const handleCellClick = (id?: string) => {
        if (
            selectionEnabled &&
            setCurrentBinding &&
            id !== currentBindingUUID
        ) {
            // TODO (JSONForms) This is hacky but it works.
            // It clears out the current binding before switching.
            //  If a user is typing quickly in a form and then selects a
            //  different binding VERY quickly it could cause the updates
            //  to go into the wrong form.
            setCurrentBinding(null);

            if (typeof id === 'string') {
                hackyTimeout.current = window.setTimeout(() => {
                    setCurrentBinding(id);
                });
            }
        }
    };

    return (
        <Box sx={{ height: '100%' }} ref={notificationAnchorEl}>
            <Popper
                anchorEl={notificationAnchorEl.current}
                open={Boolean(showNotification && notificationAnchorEl.current)}
                placement="top"
            >
                <AlertBox hideIcon short severity="success" title={null}>
                    {notificationMessage}
                </AlertBox>
            </Popper>

            <TableContainer
                component={Box}
                width="100%"
                sx={{
                    height: '100%',
                }}
            >
                <Table
                    component={Box}
                    stickyHeader
                    sx={{
                        height: '100%',
                        overflow: 'hidden',
                        [`& .MuiTableCell-root`]: {
                            display: 'flex',
                            height: DEFAULT_ROW_HEIGHT,
                            padding: 0,
                        },
                        [`& .MuiTableCell-body`]: {
                            cursor: selectionEnabled ? 'pointer' : undefined,
                        },
                        [`& .MuiTableHead-root .MuiTableRow-root`]: {
                            pr: scrollGap ? `${scrollGap}px` : undefined,
                        },
                        [`& .MuiTableRow-root`]: {
                            display: 'flex',
                        },
                        // We do a lot of rendering down below - need to keep styling as fast as possible
                        //  so just putting this on the wrapper
                        [`& .MuiTableCell-head:nth-of-type(1),
                        & .MuiTableCell-body:nth-of-type(1)`]: {
                            minWidth: 125,
                            width: 125,
                        },
                        [`& .MuiTableCell-head:nth-of-type(2),
                        & .MuiTableCell-body:nth-of-type(2)`]: {
                            ...(truncateTextSx as any),
                            flexGrow: 1,
                        },
                        [`& .MuiTableCell-head:nth-of-type(3),
                        & .MuiTableCell-body:nth-of-type(3)`]: {
                            minWidth: 52,
                            width: 52,
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                    }}
                >
                    <EntityTableHeader
                        columns={columns}
                        enableDivRendering
                        height={DEFAULT_ROW_HEIGHT} // This is required for FF to render the body for some reason
                    />
                    <TableBody component="div">
                        <AutoSizer>
                            {({ height, width }: AutoSizer['state']) => {
                                return (
                                    <FixedSizeList
                                        ref={scrollingElementCallback}
                                        innerRef={virtualRows}
                                        outerRef={scrollingElementRef}
                                        overscanCount={10}
                                        height={height} // Adjust for header height
                                        itemSize={DEFAULT_ROW_HEIGHT} // Row height
                                        width={width}
                                        itemCount={filteredRows.length}
                                        itemData={filteredRows}
                                        itemKey={(index, data) =>
                                            data[index][
                                                COLLECTION_SELECTOR_UUID_COL
                                            ]
                                        }
                                    >
                                        {({ index, style, data }) => {
                                            const row = data[index];

                                            return (
                                                <TableRow
                                                    key={
                                                        row[
                                                            COLLECTION_SELECTOR_UUID_COL
                                                        ]
                                                    }
                                                    component={Box}
                                                    style={style}
                                                    selected={
                                                        row[
                                                            COLLECTION_SELECTOR_UUID_COL
                                                        ] === currentBindingUUID
                                                    }
                                                    hover={selectionEnabled}
                                                >
                                                    {columns.map((column) => {
                                                        return (
                                                            <TableCell
                                                                align={
                                                                    column.align
                                                                }
                                                                key={`${column.field}_${
                                                                    row[
                                                                        COLLECTION_SELECTOR_UUID_COL
                                                                    ]
                                                                }`}
                                                                component="div"
                                                                onClick={
                                                                    Boolean(
                                                                        column.preventSelect
                                                                    )
                                                                        ? undefined
                                                                        : () => {
                                                                              handleCellClick(
                                                                                  row[
                                                                                      COLLECTION_SELECTOR_UUID_COL
                                                                                  ]
                                                                              );
                                                                          }
                                                                }
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
                                );
                            }}
                        </AutoSizer>
                    </TableBody>
                    <TableFooter component="div">
                        <TableRow component="div">
                            <TableCell component="div">
                                {filterValue.length > 0
                                    ? `Viewing: ${filteredRows.length} of ${mappedResourceConfigs.length}`
                                    : `Total: ${mappedResourceConfigs.length}`}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default CollectionSelectorList;
