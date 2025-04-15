import type { CollectionSelectorBodyProps } from 'src/components/collection/Selector/types';

import { useRef } from 'react';

import { Box, TableBody, TableCell, TableRow } from '@mui/material';

import { useUnmount } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import {
    COLLECTION_SELECTOR_UUID_COL,
    DEFAULT_ROW_HEIGHT,
} from 'src/components/collection/Selector/List/shared';
import { useBinding_currentBindingUUID } from 'src/stores/Binding/hooks';

function CollectionSelectorBody({
    columns,
    filterValue,
    rows,
    selectionEnabled,
    setCurrentBinding,
    tableScroller,
    scrollingElementCallback,
    checkScrollbarVisibility,
}: CollectionSelectorBodyProps) {
    const hackyTimeout = useRef<number | null>(null);
    const scrollingElementRef = useRef<FixedSizeList | undefined>(undefined);
    const virtualRows = useRef<any | null>(null);

    const currentBindingUUID = useBinding_currentBindingUUID();

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
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
        <TableBody component="div">
            <AutoSizer>
                {({ height, width }: AutoSizer['state']) => {
                    return (
                        <FixedSizeList
                            ref={scrollingElementCallback}
                            innerRef={virtualRows}
                            outerRef={scrollingElementRef}
                            height={height} // Adjust for header height
                            itemCount={rows.length}
                            itemData={rows}
                            itemKey={(index, data) =>
                                data[index][COLLECTION_SELECTOR_UUID_COL]
                            }
                            itemSize={DEFAULT_ROW_HEIGHT} // Row height
                            overscanCount={10}
                            width={width}
                            onItemsRendered={() => {
                                checkScrollbarVisibility();
                            }}
                        >
                            {({ index, style, data }) => {
                                const row = data[index];

                                return (
                                    <TableRow
                                        key={row[COLLECTION_SELECTOR_UUID_COL]}
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
                                                    align={column.align}
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
                                                    {column.renderCell?.(
                                                        {
                                                            row,
                                                        },
                                                        filterValue
                                                    )}
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
    );
}

export default CollectionSelectorBody;
