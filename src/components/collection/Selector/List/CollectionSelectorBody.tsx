import type { CollectionSelectorBodyProps } from 'src/components/collection/Selector/types';

import { useRef } from 'react';

import { Box, TableBody, TableCell, TableRow } from '@mui/material';

import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import {
    COLLECTION_SELECTOR_UUID_COL,
    DEFAULT_ROW_HEIGHT,
} from 'src/components/collection/Selector/List/shared';
import { TABLE_BODY_CELL_CLASS_PREFIX } from 'src/components/tables/EntityTable/shared';
import {
    useBinding_currentBindingUUID,
    useBinding_setCurrentBindingWithTimeout,
} from 'src/stores/Binding/hooks';

function CollectionSelectorBody({
    columns,
    filterValue,
    height: parentHeight,
    rows,
    selectionEnabled,
    setCurrentBinding,
    tableScroller,
    scrollingElementCallback,
    checkScrollbarVisibility,
}: CollectionSelectorBodyProps) {
    const setCurrentBindingWithTimeout =
        useBinding_setCurrentBindingWithTimeout(setCurrentBinding);
    const scrollingElementRef = useRef<FixedSizeList | undefined>(undefined);
    const virtualRows = useRef<any | null>(null);

    const currentBindingUUID = useBinding_currentBindingUUID();

    const handleCellClick = (id?: string) => {
        if (selectionEnabled && setCurrentBinding) {
            setCurrentBindingWithTimeout(id);
        }
    };

    return (
        <TableBody
            component="div"
            sx={{
                // TODO (Safari Height Hack) - Safari ignores the height when the display is `table-row-group`
                display: 'table-cell',
                // TODO (FireFox Height Hack) - hardcoded height to make life easier
                height: parentHeight,
            }}
        >
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
                                        selected={Boolean(
                                            selectionEnabled &&
                                                row[
                                                    COLLECTION_SELECTOR_UUID_COL
                                                ] === currentBindingUUID
                                        )}
                                        hover={selectionEnabled}
                                    >
                                        {columns.map((column) => {
                                            return (
                                                <TableCell
                                                    className={`${TABLE_BODY_CELL_CLASS_PREFIX}${column.field}`}
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
