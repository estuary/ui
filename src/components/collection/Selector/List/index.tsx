import type { FixedSizeList } from 'react-window';
import type {
    CollectionSelectorListProps,
    CollectionSelectorMappedResourceConfig,
} from 'src/components/collection/Selector/types';
import type { ColumnProps } from 'src/components/tables/EntityTable/types';

import { useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';

import { Box, Popper, Table, TableContainer } from '@mui/material';

import { debounce, isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import { usePrevious } from 'react-use';

import CollectionSelectorBody from 'src/components/collection/Selector/List/CollectionSelectorBody';
import CollectionSelectorFooter from 'src/components/collection/Selector/List/CollectionSelectorFooter';
import CollectionSelectorHeaderName from 'src/components/collection/Selector/List/Header/Name';
import CollectionSelectorHeaderRemove from 'src/components/collection/Selector/List/Header/Remove';
import CollectionSelectorHeaderToggle from 'src/components/collection/Selector/List/Header/Toggle';
import {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_REMOVE,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_TOGGLE_COL,
    COLLECTION_SELECTOR_UUID_COL,
    DEFAULT_ROW_HEIGHT,
} from 'src/components/collection/Selector/List/shared';
import NoResults from 'src/components/editor/Bindings/NoResults';
import SelectorEmpty from 'src/components/editor/Bindings/SelectorEmpty';
import AlertBox from 'src/components/shared/AlertBox';
import {
    TABLE_BODY_CELL_CLASS_PREFIX,
    TABLE_HEADER_CELL_CLASS_PREFIX,
} from 'src/components/tables/EntityTable/shared';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { truncateTextSx } from 'src/context/Theme';
import { useBindingSelectorCells } from 'src/hooks/useBindingSelectorCells';
import { useBindingSelectorNotification } from 'src/hooks/useBindingSelectorNotification';
import { useReactWindowScrollbarGap } from 'src/hooks/useReactWindowScrollbarGap';
import {
    useBinding_currentBindingUUID,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { stripPathing } from 'src/utils/misc-utils';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

function CollectionSelectorList({
    disableActions,
    header,
    setCurrentBinding,
}: CollectionSelectorListProps) {
    const bindingSelectorCells = useBindingSelectorCells();
    const {
        displayNotification,
        notificationAnchorEl,
        notificationMessage,
        showPopper,
    } = useBindingSelectorNotification();

    const [filterValue, setFilterValue] = useState('');
    const [filterInputValue, setFilterInputValue] = useState('');
    const previousFilterValue = usePrevious(filterValue);

    const tableScroller = useRef<FixedSizeList | undefined>(undefined);
    const { scrollGap, scrollingElementCallback, checkScrollbarVisibility } =
        useReactWindowScrollbarGap<FixedSizeList>(tableScroller, true);

    const intl = useIntl();
    const collectionsLabel = useConstant(
        () =>
            header ??
            intl.formatMessage({
                id: 'workflows.collectionSelector.label.listHeader',
            })
    );

    // Binding Store
    const currentBindingUUID = useBinding_currentBindingUUID();
    const resourceConfigs = useBinding_resourceConfigs();

    // Form State Store
    const formStatus = useFormStateStore_status();

    const selectionEnabled = Boolean(
        setCurrentBinding && formStatus !== FormStatus.UPDATING
    );

    const mappedResourceConfigs: CollectionSelectorMappedResourceConfig[] =
        useMemo(() => {
            // If we have no bindings we can just return an empty array
            if (isEmpty(resourceConfigs)) {
                return [];
            }

            // We have bindings so need to format them in a format that mui
            //  datagrid will handle. At a minimum each object must have an
            //  `id` property.
            return Object.entries(resourceConfigs).map(
                ([bindingUUID, config]) => {
                    const collection = config.meta.collectionName;

                    return {
                        [COLLECTION_SELECTOR_UUID_COL]: bindingUUID,
                        [COLLECTION_SELECTOR_NAME_COL]: collection,
                        [COLLECTION_SELECTOR_STRIPPED_PATH_NAME]:
                            stripPathing(collection),
                    };
                }
            );
        }, [resourceConfigs]);

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

    const columns = useMemo(() => {
        const response: ColumnProps[] = [
            {
                field: COLLECTION_SELECTOR_NAME_COL,
                renderInlineHeader: () => {
                    return (
                        <CollectionSelectorHeaderName
                            disabled={disable}
                            inputValue={filterInputValue}
                            itemType={collectionsLabel}
                            onChange={(value) => {
                                setFilterInputValue(value);
                                debouncedFilter.current(value);
                            }}
                        />
                    );
                },
                renderCell: (params: any) =>
                    bindingSelectorCells.name.cellRenderer(params, filterValue),
            },
        ];

        if (bindingSelectorCells.toggle) {
            response.unshift({
                field: COLLECTION_SELECTOR_TOGGLE_COL,
                renderCell: bindingSelectorCells.toggle.cellRenderer,
                renderInlineHeader: () => (
                    <CollectionSelectorHeaderToggle
                        disabled={disable || rowsEmpty}
                        itemType={collectionsLabel}
                        onClick={(event, value, scope) => {
                            const count =
                                bindingSelectorCells.toggle?.handler?.(
                                    filteredRows.map((datum) => {
                                        return datum[
                                            COLLECTION_SELECTOR_UUID_COL
                                        ];
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

        if (bindingSelectorCells.remove) {
            response.push({
                align: 'right',
                field: COLLECTION_SELECTOR_REMOVE,
                preventSelect: true,
                renderCell: bindingSelectorCells.remove.cellRenderer,
                renderInlineHeader: () => (
                    <CollectionSelectorHeaderRemove
                        disabled={disable || rowsEmpty}
                        itemType={collectionsLabel}
                        onClick={(event) => {
                            if (filteredRows && filteredRows.length > 0) {
                                bindingSelectorCells.remove?.handler?.(
                                    filteredRows.map((datum) => {
                                        return datum[
                                            COLLECTION_SELECTOR_UUID_COL
                                        ];
                                    })
                                );

                                // We need to clear out the filter
                                setFilterValue('');
                                setFilterInputValue('');

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
        bindingSelectorCells.name,
        bindingSelectorCells.remove,
        bindingSelectorCells.toggle,
        collectionsLabel,
        disable,
        filterInputValue,
        filterValue,
        filteredRows,
        intl,
        rowsEmpty,
        showPopper,
    ]);

    return (
        <Box sx={{ flex: 1 }} ref={notificationAnchorEl}>
            <Popper
                anchorEl={notificationAnchorEl.current}
                open={displayNotification}
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
                        [`& .MuiTableBody-root .MuiTableCell-root,
                        & .MuiTableHead-root .MuiTableCell-root`]: {
                            display: 'flex',
                            height: DEFAULT_ROW_HEIGHT,
                            padding: 0,
                        },
                        [`& .MuiTableCell-body`]: {
                            cursor: selectionEnabled ? 'pointer' : undefined,
                        },
                        [`& .MuiTableHead-root .MuiTableRow-root,
                        & .MuiTableFooter-root .MuiTableRow-root`]: {
                            pr: scrollGap ? `${scrollGap}px` : undefined,
                        },
                        [`& .MuiTableRow-root`]: {
                            display: 'flex',
                        },
                        // TODO (theme - kinda) Probably just move this chunk into the theme file. Also, we probably want to
                        //  look into doing more styling based on the parent.
                        // We do a lot of rendering down below - need to keep styling as fast as possible
                        //  so just putting this on the wrapper
                        [`& .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL},
                            & .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_TOGGLE_COL}`]:
                            {
                                minWidth: 125,
                                width: 125,
                            },
                        [`& .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL},
                            & .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_NAME_COL}`]:
                            {
                                ...(truncateTextSx as any),
                                flexGrow: 1,
                            },
                        [`& .${TABLE_HEADER_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE},
                            & .${TABLE_BODY_CELL_CLASS_PREFIX}${COLLECTION_SELECTOR_REMOVE}`]:
                            {
                                minWidth: 52,
                                width: 52,
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                    }}
                >
                    <EntityTableHeader
                        columns={columns}
                        disableBackground
                        enableDivRendering
                        height={DEFAULT_ROW_HEIGHT}
                    />

                    {mappedResourceConfigs.length === 0 ? (
                        <SelectorEmpty />
                    ) : filterValue.length > 0 && filteredRows.length === 0 ? (
                        <NoResults />
                    ) : null}

                    <CollectionSelectorBody
                        columns={columns}
                        filterValue={filterValue}
                        rows={filteredRows}
                        selectionEnabled={selectionEnabled}
                        setCurrentBinding={setCurrentBinding}
                        tableScroller={tableScroller}
                        scrollingElementCallback={scrollingElementCallback}
                        checkScrollbarVisibility={checkScrollbarVisibility}
                    />

                    <CollectionSelectorFooter
                        columnCount={columns.length}
                        filteredCount={
                            filterValue.length > 0
                                ? filteredRows.length
                                : undefined
                        }
                        totalCount={mappedResourceConfigs.length}
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default CollectionSelectorList;
