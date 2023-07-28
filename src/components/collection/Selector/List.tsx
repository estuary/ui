import { Box, Typography } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridColumnHeaderParams,
    GridRenderCellParams,
    GridSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { dataGridListStyling } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import useConstant from 'use-constant';
import { useStore } from 'zustand';
import CollectionSelectorRow from './Row';

interface Props {
    currentCollection?: any;
    enableRemove?: boolean;
    header?: string;
    height?: number;
    readOnly?: boolean;
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
    currentCollection,
    enableRemove,
    header,
    height,
    readOnly,
    renderCell,
    setCurrentCollection,
}: Props) {
    const onSelectTimeOut = useRef<number | null>(null);
    const intl = useIntl();
    const collectionsLabel = useConstant(
        () =>
            header ??
            intl.formatMessage({
                id: 'workflows.collectionSelector.label.listHeader',
            })
    );

    const selectionEnabled = currentCollection && setCurrentCollection;
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );
    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    const { selected, setSelected } = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return {
                selected: state.selected,
                setSelected: state.setSelected,
            };
        }
    );

    const rows = Array.from(selected).map((collection) => ({
        id: collection,
        name: collection,
    }));

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: collectionsLabel,
            sortable: false,
            renderHeader: (params: GridColumnHeaderParams) => (
                <Typography>{params.colDef.headerName}</Typography>
            ),
            renderCell: (params: GridRenderCellParams) => {
                if (renderCell) {
                    return renderCell(params);
                } else if (enableRemove) {
                    return (
                        <CollectionSelectorRow
                            collection={params.value}
                            disabled={readOnly}
                            removeCollection={(collection) => {
                                console.log('collection');
                                setSelected(collection, collection, false);
                            }}
                        />
                    );
                }
            },
            valueGetter: (params: GridValueGetterParams) => {
                return params.row.name;
            },
        },
    ];

    useUnmount(() => {
        if (onSelectTimeOut.current) clearTimeout(onSelectTimeOut.current);
    });

    return (
        <Box sx={{ height: height ?? 480 }}>
            <DataGrid
                components={{
                    NoRowsOverlay: SelectorEmpty,
                }}
                rows={rows}
                columns={columns}
                headerHeight={40}
                rowCount={rows.length}
                hideFooter
                disableColumnSelector
                disableSelectionOnClick={!selectionEnabled}
                selectionModel={selectionEnabled ? selectionModel : undefined}
                onRowClick={
                    selectionEnabled
                        ? (params: any) => {
                              // This is hacky but it works. It clears out the
                              //  current collection before switching.
                              //  If a user is typing quickly in a form and then selects a
                              //  different binding VERY quickly it could cause the updates
                              //  to go into the wrong form.
                              setCurrentCollection(null);
                              onSelectTimeOut.current = window.setTimeout(
                                  () => {
                                      setCurrentCollection(params.row.name);
                                  }
                              );
                          }
                        : undefined
                }
                initialState={initialState}
                sx={dataGridListStyling}
            />
        </Box>
    );
}

export default CollectionSelectorList;
