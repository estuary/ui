import type { FixedSizeList } from 'react-window';
import type {
    CollectionSelectorListProps,
    CollectionSelectorMappedResourceConfig,
} from 'src/components/collection/Selector/types';
import type { ColumnProps } from 'src/components/tables/EntityTable/types';

import { useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';

import { Box, Popper, TableContainer } from '@mui/material';

import { findAll } from 'highlight-words-core';
import { debounce, isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import { usePrevious, useUnmount } from 'react-use';

import CollectionSelectorBody from 'src/components/collection/Selector/List/CollectionSelectorBody';
import CollectionSelectorFooter from 'src/components/collection/Selector/List/CollectionSelectorFooter';
import CollectionSelectorTable from 'src/components/collection/Selector/List/CollectionSelectorTable';
import CollectionSelectorHeaderName from 'src/components/collection/Selector/List/Header/Name';
import CollectionSelectorHeaderRemove from 'src/components/collection/Selector/List/Header/Remove';
import CollectionSelectorHeaderToggle from 'src/components/collection/Selector/List/Header/Toggle';
import {
    COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS,
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_REMOVE,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_TOGGLE_COL,
    COLLECTION_SELECTOR_UUID_COL,
    DEFAULT_ROW_HEIGHT,
    ENABLE_SCROLL_GAP,
    ENABLE_SELECTION,
} from 'src/components/collection/Selector/List/shared';
import NoResults from 'src/components/editor/Bindings/NoResults';
import SelectorEmpty from 'src/components/editor/Bindings/SelectorEmpty';
import AlertBox from 'src/components/shared/AlertBox';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useBindingSelectorCells } from 'src/hooks/useBindingSelectorCells';
import { useBindingSelectorNotification } from 'src/hooks/useBindingSelectorNotification';
import { useReactWindowScrollbarGap } from 'src/hooks/useReactWindowScrollbarGap';
import {
    useBinding_currentBindingUUID,
    useBinding_resourceConfigs,
    useBinding_setCurrentBindingWithTimeout,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { stripPathing } from 'src/utils/misc-utils';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

function CollectionSelectorList({
    disableActions,
    header,
    height,
    hideFooter,
    setCurrentBinding,
}: CollectionSelectorListProps) {
    // Form State Store
    const formStatus = useFormStateStore_status();

    const selectionEnabled = Boolean(
        setCurrentBinding && formStatus !== FormStatus.UPDATING
    );
    const setCurrentBindingWithTimeout =
        useBinding_setCurrentBindingWithTimeout(setCurrentBinding);

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
                        [COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS]: [],
                        [COLLECTION_SELECTOR_TOGGLE_COL]: Boolean(
                            config.meta.disable
                        ),
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
    useUnmount(() => {
        debouncedFilter.current?.cancel();
    });

    const filteredRows = useMemo(() => {
        if (filterValue === '') {
            return mappedResourceConfigs;
        }

        // If you want to match on multiple words you can. However, this search is as
        //  inclusive as possible. So if a name only matches a _single_ searchWord it will
        //  be returned. searchWords = filterValue.split(',').map((val) => val.trim());
        const searchWords = [filterValue];

        return mappedResourceConfigs
            .map((row) => {
                row[COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS] = findAll({
                    autoEscape: true,
                    caseSensitive: false,
                    searchWords,
                    textToHighlight: row[COLLECTION_SELECTOR_NAME_COL],
                });

                return row;
            })
            .filter((row) => {
                return row[COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS].some(
                    (chunk) => chunk.highlight
                );
            });
    }, [filterValue, mappedResourceConfigs]);

    useEffect(() => {
        if (
            // Selection disabled
            !selectionEnabled ||
            // Filter has not changed so we can skip. Otherwise while the bindings are filtered
            //  if a user clicks manually on a binding then it will be selected and a split second
            //  later this effect will run and set it back to a default value.
            (filterValue.length > 0 &&
                previousFilterValue &&
                previousFilterValue.length > 0 &&
                filterValue === previousFilterValue)
        ) {
            return;
        }

        if (filterValue !== '') {
            // If we have filtered values then see if this is a first search and default
            if (previousFilterValue === '') {
                setCurrentBindingWithTimeout(
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
                    setCurrentBindingWithTimeout(
                        filteredRows[0]?.[COLLECTION_SELECTOR_UUID_COL]
                    );
                }
            }

            return;
        }

        if (previousFilterValue !== '' && Boolean(mappedResourceConfigs[0])) {
            setCurrentBindingWithTimeout(
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
        setCurrentBindingWithTimeout,
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

    const someBindingsDisabled = useMemo(() => {
        return Object.values(filteredRows).some((row) => {
            return row.disable;
        });
    }, [filteredRows]);

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
                        defaultValue={someBindingsDisabled}
                        onClick={async (event, value, scope) => {
                            return bindingSelectorCells.toggle
                                ?.handler?.(
                                    filteredRows.map((datum) => {
                                        return datum[
                                            COLLECTION_SELECTOR_UUID_COL
                                        ];
                                    }),
                                    value
                                )
                                .then((response) => {
                                    showPopper(
                                        event.currentTarget,
                                        intl.formatMessage(
                                            {
                                                id: value
                                                    ? 'workflows.collectionSelector.notifications.toggle.disable'
                                                    : 'workflows.collectionSelector.notifications.toggle.enable',
                                            },
                                            {
                                                count: `${response.length}`,
                                                itemType: collectionsLabel,
                                            }
                                        )
                                    );

                                    return Promise.resolve(response);
                                });
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
        someBindingsDisabled,
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
                className={`${Boolean(scrollGap) ? ENABLE_SCROLL_GAP : ''} ${selectionEnabled ? ENABLE_SELECTION : ''}`}
                sx={{
                    height: '100%',
                    width: '100%',
                    // TODO (FireFox Height Hack) - added overflow so the scroll bar does not show up
                    overflow: 'hidden',
                }}
            >
                <CollectionSelectorTable>
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
                        // TODO (FireFox Height Hack)
                        // Magic number - it works and I hate it.
                        // Do not copy this anywhere.
                        // You need the height to hit some super magic special thing that makes no sense so FireFox will render the footer at the bottom.
                        height={height - 120}
                        filterValue={filterValue}
                        rows={filteredRows}
                        selectionEnabled={selectionEnabled}
                        setCurrentBinding={setCurrentBinding}
                        tableScroller={tableScroller}
                        scrollingElementCallback={scrollingElementCallback}
                        checkScrollbarVisibility={checkScrollbarVisibility}
                    />

                    {hideFooter ? null : (
                        <CollectionSelectorFooter
                            columnCount={columns.length}
                            totalCount={mappedResourceConfigs.length}
                        />
                    )}
                </CollectionSelectorTable>
            </TableContainer>
        </Box>
    );
}

export default CollectionSelectorList;
