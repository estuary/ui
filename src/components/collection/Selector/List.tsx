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
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import useConstant from 'use-constant';
import CollectionSelectorHeader from './Header';
import CollectionSelectorRow from './Row';

interface Props {
    collections: Set<string>;
    header?: string;
    removeCollection?: (collectionName: string) => void;
    currentCollection?: any;
    setCurrentCollection?: (collection: any) => void;
    height?: number;
    renderCell?: (params: GridRenderCellParams) => void;
    readOnly?: boolean;
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function CollectionSelectorList({
    readOnly,
    collections,
    header,
    removeCollection,
    currentCollection,
    setCurrentCollection,
    height,
    renderCell,
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
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );
    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    const collectionsArray = Array.from(collections);

    const rows = collectionsArray.map((collection) => ({
        id: collection,
        name: collection,
    }));

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: collectionsLabel,
            sortable: false,
            renderHeader: (_params) => (
                <CollectionSelectorHeader
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
                disableColumnMenu
                disableColumnSelector
                disableSelectionOnClick={!selectionEnabled}
                filterModel={filterModel}
                hideFooterSelectedRowCount
                initialState={initialState}
                rowCount={rows.length}
                rows={rows}
                selectionModel={selectionEnabled ? selectionModel : undefined}
                sx={dataGridListStyling}
                onRowClick={
                    selectionEnabled
                        ? (params: any) => {
                              // TODO (JSONForms) This is hacky but it works.
                              // It clears out the current collection before switching.
                              //  If a user is typing quickly in a form and then selects a
                              //  different binding VERY quickly it could cause the updates
                              //  to go into the wrong form.
                              setCurrentCollection(null);
                              hackyTimeout.current = window.setTimeout(() => {
                                  setCurrentCollection(params.row.name);
                              });
                          }
                        : undefined
                }
            />
        </Box>
    );
}

export default CollectionSelectorList;
