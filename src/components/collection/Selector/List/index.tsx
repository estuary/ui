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
import CollectionSelectorHeaderName from './Header/Name';
import CollectionSelectorHeaderRemove from './Header/Remove';
import CollectionSelectorHeaderToggle from './Header/Toggle';

interface Props {
    collections: Set<string>;
    currentCollection?: any;
    disableActions?: boolean;
    renderCell?: (params: GridRenderCellParams) => void;
    renderers?: {
        cell: {
            name: (params: any) => void;
            remove?: (params: any) => void;
            toggle?: (params: any) => void;
        };
    };
    header?: string;
    height?: number | string;
    removeAllCollections?: (event: React.MouseEvent<HTMLElement>) => void;
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
    removeAllCollections,
    renderCell,
    renderers,
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

    const columns = useMemo(() => {
        const response: GridColDef[] = [
            {
                field: 'toggle',
                headerName: 'Toggle enabled',
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderToggle
                        disabled={disableActions}
                        onClick={(event) => {
                            console.log('event', event);
                        }}
                    />
                ),
                renderCell: renderers?.cell.toggle,
                valueGetter: (params) => {
                    console.log('toggle getter');
                    return params.row.name;
                },
            },
            {
                field: 'name',
                flex: 1,
                headerName: collectionsLabel,
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderName
                        disabled={disableActions}
                        itemType={collectionsLabel}
                        onChange={(value) => {
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
                    />
                ),
                renderCell,
                valueGetter: (params) => {
                    return params.row.name;
                },
            },
        ];

        if (removeAllCollections) {
            response.push({
                field: 'remove',
                headerName: 'Remove',
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderRemove
                        disabled={disableActions}
                        itemType={collectionsLabel}
                        onClick={(event) => {
                            removeAllCollections(event);
                        }}
                    />
                ),
                renderCell: renderers?.cell.remove,
                valueGetter: (params) => {
                    console.log('remove getter');
                    return params.row.name;
                },
            });
        }
        return response;
    }, [
        collectionsLabel,
        disableActions,
        removeAllCollections,
        renderCell,
        renderers?.cell.remove,
        renderers?.cell.toggle,
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
