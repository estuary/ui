import { Box } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    GridSelectionModel,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { dataGridListStyling } from 'context/Theme';
import { debounce, isEmpty } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import {
    useResourceConfig_collections,
    useResourceConfig_currentCollection,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import CollectionSelectorHeaderName from './Header/Name';
import CollectionSelectorHeaderRemove from './Header/Remove';
import CollectionSelectorHeaderToggle from './Header/Toggle';

interface Props {
    disableActions?: boolean;
    renderers: {
        cell: {
            name: (params: any) => void;
            remove?: (params: any) => void;
            toggle?: (params: any) => void;
        };
    };
    header?: string;
    height?: number | string;
    removeAllCollections?: (event: React.MouseEvent<HTMLElement>) => void;
    toggleAllCollections?: (event: React.MouseEvent<HTMLElement>) => void;
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
    disableActions,
    header,
    height,
    removeAllCollections,
    toggleAllCollections,
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

    const collections = useResourceConfig_collections();
    const currentCollection = useResourceConfig_currentCollection();

    const selectionEnabled = currentCollection && setCurrentCollection;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_viewableRows, setViewableRows] = useState<string[]>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );
    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    // TODO (bindings) this happens when current collection changes
    //  we should not need to run this then
    const rows = useMemo(
        () =>
            !collections
                ? []
                : collections.map((collectionName) => {
                      return {
                          id: collectionName,
                          name: collectionName,
                      };
                  }),
        [collections]
    );

    const disable = useMemo(
        () => isEmpty(rows) || disableActions,
        [disableActions, rows]
    );

    const columns = useMemo(() => {
        const response: GridColDef[] = [
            {
                field: 'name',
                flex: 1,
                headerName: collectionsLabel,
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderName
                        disabled={disable}
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
                renderCell: renderers.cell.name,
            },
        ];

        if (toggleAllCollections) {
            response.unshift({
                field: 'disable',
                sortable: false,
                renderCell: renderers.cell.toggle,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderToggle
                        disabled={disable}
                        onClick={(event) => {
                            toggleAllCollections(event);
                        }}
                    />
                ),
                valueGetter: () => null,
            });
        }

        if (removeAllCollections) {
            response.push({
                field: 'remove',
                sortable: false,
                minWidth: 52,
                maxWidth: 52,
                renderCell: renderers.cell.remove,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderRemove
                        disabled={disable}
                        itemType={collectionsLabel}
                        onClick={(event) => {
                            removeAllCollections(event);
                        }}
                    />
                ),
                valueGetter: () => null,
            });
        }
        return response;
    }, [
        collectionsLabel,
        disable,
        removeAllCollections,
        renderers.cell.name,
        renderers.cell.remove,
        renderers.cell.toggle,
        toggleAllCollections,
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
                onStateChange={debounce((state, arg1) => {
                    console.log('debounced state change');
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
                }, 750)}
                onCellClick={({ field, value }) => {
                    console.log('Cell was clicked', { field, value });

                    if (selectionEnabled && field === 'name') {
                        // TODO (JSONForms) This is hacky but it works.
                        // It clears out the current collection before switching.
                        //  If a user is typing quickly in a form and then selects a
                        //  different binding VERY quickly it could cause the updates
                        //  to go into the wrong form.
                        setCurrentCollection(null);
                        hackyTimeout.current = window.setTimeout(() => {
                            setCurrentCollection(value);
                        });
                    }
                }}
            />
        </Box>
    );
}

export default CollectionSelectorList;
