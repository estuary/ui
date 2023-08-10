import { Box } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { dataGridListStyling } from 'context/Theme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import useConstant from 'use-constant';
import CollectionSelectorHeader from './Header';
import CollectionSelectorRow from './Row';

interface Props {
    collections: Set<string>;
    currentCollection?: any;
    disableActions?: boolean;
    header?: string;
    height?: number | string;
    readOnly?: boolean;
    removeAllCollections?: (event: React.MouseEvent<HTMLElement>) => void;
    removeCollection?: (collectionName: string) => void;
    renderCell?: (params: GridRenderCellParams) => void;
    setCurrentCollection?: (collection: any) => void;
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function CollectionSelectorList({
    collections,
    currentCollection,
    disableActions,
    header,
    height,
    readOnly,
    removeAllCollections,
    removeCollection,
    renderCell,
    setCurrentCollection,
}: Props) {
    const hackyTimeout = useRef<number | null>(null);
    const intl = useIntl();
    const collectionsLabel = useConstant(
        () =>
            header ??
            intl.formatMessage({
                id: 'workflows.collectionSelector.label.listHeader',
            })
    );

    const selectionEnabled = currentCollection && setCurrentCollection;
    const [viewableRows, setViewableRows] = useState<string[]>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );
    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    console.log('viewableRows', viewableRows);

    const rows = useMemo(
        () =>
            Array.from(collections).map((collection) => ({
                id: collection,
                name: collection,
            })),
        [collections]
    );

    const columns = useMemo<GridColDef[]>(() => {
        return [
            {
                field: 'name',
                flex: 1,
                headerName: collectionsLabel,
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeader
                        disabled={disableActions}
                        itemType={collectionsLabel}
                        onFilterChange={(value) => {
                            const newFilterMode: GridFilterModel = {
                                items: [
                                    {
                                        id: 1,
                                        columnField: 'name',
                                        value,
                                        operatorValue: 'contains',
                                    },
                                ],
                            };
                            setFilterModel(newFilterMode);
                        }}
                        onRemoveAllClick={
                            removeAllCollections
                                ? (event) => {
                                      removeAllCollections(event);
                                  }
                                : undefined
                        }
                        onToggleAllClick={(event) => {
                            console.log('event', event);
                        }}
                    />
                ),
                renderCell: (params) => {
                    if (renderCell) {
                        return renderCell(params);
                    } else if (removeCollection) {
                        return (
                            <CollectionSelectorRow
                                collection={params.value}
                                disabled={readOnly}
                                removeCollection={removeCollection}
                            />
                        );
                    }
                },
                valueGetter: (params) => {
                    return params.row.name;
                },
            },
        ];
    }, [
        collectionsLabel,
        disableActions,
        readOnly,
        removeAllCollections,
        removeCollection,
        renderCell,
    ]);

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
    });

    return (
        <Box sx={{ height: height ?? 480 }}>
            <DataGrid
                columns={columns}
                components={{
                    NoRowsOverlay: SelectorEmpty,
                }}
                disableColumnFilter //prevents the filter icon from showing up
                disableColumnMenu
                disableColumnSelector
                disableSelectionOnClick={!selectionEnabled}
                filterModel={filterModel}
                hideFooterSelectedRowCount
                initialState={initialState}
                rows={rows}
                selectionModel={selectionEnabled ? selectionModel : undefined}
                sx={{ ...dataGridListStyling, border: 0 }}
                onStateChange={(state, arg1) => {
                    if (arg1.defaultMuiPrevented) {
                        console.log('prevented');
                    }
                    const currentRows = state.filter.filteredRowsLookup;
                    const updatedViewableRows: string[] = [];
                    Object.entries(currentRows).forEach(([name, visible]) => {
                        if (visible) {
                            updatedViewableRows.push(name);
                        }
                    });
                    setViewableRows(updatedViewableRows);
                }}
                onFilterModelChange={(event) => {
                    console.log('Filter model changed', { event });
                }}
                onCellClick={(event) => {
                    console.log('Cell was clicked', { event });
                }}
                onRowClick={
                    selectionEnabled
                        ? (params: any) => {
                              if (params.row.name !== currentCollection) {
                                  // TODO (JSONForms) This is hacky but it works.
                                  // It clears out the current collection before switching.
                                  //  If a user is typing quickly in a form and then selects a
                                  //  different binding VERY quickly it could cause the updates
                                  //  to go into the wrong form.
                                  setCurrentCollection(null);
                                  hackyTimeout.current = window.setTimeout(
                                      () => {
                                          setCurrentCollection(params.row.name);
                                      }
                                  );
                              }
                          }
                        : undefined
                }
            />
        </Box>
    );
}

export default CollectionSelectorList;
