import { Box } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridFilterModel,
    gridPaginatedVisibleSortedGridRowIdsSelector,
    GridRowId,
    GridRowSelectionModel,
    useGridApiRef,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { dataGridListStyling } from 'context/Theme';
import { OptionsObject, useSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import {
    useResourceConfig_collections,
    useResourceConfig_currentCollection,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import { hasLength } from 'utils/misc-utils';
import { snackbarSettings } from 'utils/notification-utils';
import CollectionSelectorHeaderName from './Header/Name';
import CollectionSelectorHeaderRemove from './Header/Remove';
import CollectionSelectorHeaderToggle from './Header/Toggle';
import { COLLECTION_SELECTOR_NAME_COL } from './shared';

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
    removeCollections?: (rows: GridRowId[]) => void;
    toggleCollections?: (rows: GridRowId[], value: boolean) => void;
    setCurrentCollection?: (collection: any) => void;
}

const localSnackbarSettings: OptionsObject = {
    ...snackbarSettings,
    autoHideDuration: 1500,
    variant: 'success',
};

const cellClass_noPadding = 'estuary-datagrid--cell--no-padding';

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

const defaultFilterModel = {
    items: [],
};

function CollectionSelectorList({
    disableActions,
    header,
    height,
    removeCollections,
    toggleCollections,
    renderers,
    setCurrentCollection,
}: Props) {
    const apiRef = useGridApiRef();
    const { enqueueSnackbar } = useSnackbar();

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

    const collections = useResourceConfig_collections();
    const currentCollection = useResourceConfig_currentCollection();

    const selectionEnabled = currentCollection && setCurrentCollection;
    const [filterModel, setFilterModel] =
        useState<GridFilterModel>(defaultFilterModel);

    // We use mui`s selection model to store which collection was clicked on to display it
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        []
    );
    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    const rows = useMemo(() => {
        // If we have no collections we can just return an empty array
        if (!collections) {
            return [];
        }

        // We have collections so need to format them in a format that mui
        //  datagrid will handle. At a minimum each object must have an
        //  `id` property. This is why the name is stored as `id`
        return collections.map((collectionName) => {
            return {
                [COLLECTION_SELECTOR_NAME_COL]: collectionName,
            };
        });
    }, [collections]);

    const rowsEmpty = useMemo(() => !hasLength(rows), [rows]);

    const disable = useMemo(
        () => rowsEmpty || disableActions,
        [disableActions, rowsEmpty]
    );

    const columns = useMemo(() => {
        const response: GridColDef[] = [
            {
                cellClassName: cellClass_noPadding,
                field: COLLECTION_SELECTOR_NAME_COL,
                flex: 1,
                headerName: collectionsLabel,
                sortable: false,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderName
                        disabled={disable}
                        inputValue={filterValue}
                        itemType={collectionsLabel}
                        onChange={(value) => {
                            setFilterValue(value);

                            const newFilterMode: GridFilterModel = {
                                items: [
                                    {
                                        id: 1,
                                        field: COLLECTION_SELECTOR_NAME_COL,
                                        value,
                                        operator: 'contains',
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

        if (toggleCollections) {
            response.unshift({
                cellClassName: cellClass_noPadding,
                headerClassName: cellClass_noPadding,
                field: 'disable',
                sortable: false,
                renderCell: renderers.cell.toggle,
                renderHeader: (_params) => (
                    <CollectionSelectorHeaderToggle
                        disabled={disable}
                        itemType={collectionsLabel}
                        onClick={(event, value) => {
                            const filteredCollections =
                                gridPaginatedVisibleSortedGridRowIdsSelector(
                                    apiRef.current.state
                                );
                            if (hasLength(filteredCollections)) {
                                toggleCollections(filteredCollections, value);
                            }

                            enqueueSnackbar(
                                intl.formatMessage(
                                    {
                                        id: value
                                            ? 'workflows.collectionSelector.notifications.toggle.enable'
                                            : 'workflows.collectionSelector.notifications.toggle.disable',
                                    },
                                    {
                                        count: filteredCollections.length,
                                        itemType: collectionsLabel,
                                    }
                                ),
                                localSnackbarSettings
                            );
                        }}
                    />
                ),
                valueGetter: () => null,
            });
        }

        if (removeCollections) {
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
                        onClick={(_event) => {
                            const filteredCollections =
                                gridPaginatedVisibleSortedGridRowIdsSelector(
                                    apiRef.current.state
                                );

                            if (hasLength(filteredCollections)) {
                                removeCollections(filteredCollections);
                                setFilterModel(defaultFilterModel);
                                setFilterValue('');
                            }

                            enqueueSnackbar(
                                intl.formatMessage(
                                    {
                                        id: 'workflows.collectionSelector.notifications.remove',
                                    },
                                    {
                                        count: filteredCollections.length,
                                        itemType: collectionsLabel,
                                    }
                                ),
                                localSnackbarSettings
                            );
                        }}
                    />
                ),
                valueGetter: () => null,
            });
        }
        return response;
    }, [
        apiRef,
        collectionsLabel,
        disable,
        enqueueSnackbar,
        filterValue,
        intl,
        removeCollections,
        renderers.cell.name,
        renderers.cell.remove,
        renderers.cell.toggle,
        toggleCollections,
    ]);

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
    });

    return (
        <Box sx={{ height: height ?? 480 }}>
            <DataGrid
                apiRef={apiRef}
                columns={columns}
                components={{ NoRowsOverlay: SelectorEmpty }}
                disableColumnFilter //prevents the filter icon from showing up
                disableColumnMenu
                disableColumnSelector
                disableRowSelectionOnClick={!selectionEnabled}
                filterModel={filterModel}
                hideFooterPagination={rowsEmpty}
                hideFooterSelectedRowCount
                initialState={initialState}
                rows={rows}
                rowSelectionModel={
                    selectionEnabled ? selectionModel : undefined
                }
                sx={{
                    ...dataGridListStyling,
                    border: 0,
                    [`& .${cellClass_noPadding}`]: { padding: 0 },
                }}
                onCellClick={({ field, value }) => {
                    if (
                        selectionEnabled &&
                        field === COLLECTION_SELECTOR_NAME_COL &&
                        value !== currentCollection
                    ) {
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
