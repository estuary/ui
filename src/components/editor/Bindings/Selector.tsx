import { Clear } from '@mui/icons-material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, IconButton, ListItemText, TypographyProps } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import CollectionPicker from 'components/collection/Picker';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import {
    useResourceConfig_currentCollection,
    useResourceConfig_removeCollection,
    useResourceConfig_resourceConfig,
    useResourceConfig_setCurrentCollection,
} from 'stores/ResourceConfig';

interface DeleteButtonProps {
    collection: string;
}

function DeleteButton({ collection }: DeleteButtonProps) {
    const removeCollection = useResourceConfig_removeCollection();

    const handlers = {
        removeCollection: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            removeCollection(collection);
        },
    };

    return (
        <IconButton size="small" onClick={handlers.removeCollection}>
            <Clear />
        </IconButton>
    );
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

const typographyTruncation: TypographyProps = {
    noWrap: true,
    sx: {
        minWidth: 0,
    },
};

function BindingSelector() {
    const onSelectTimeOut = useRef<number | null>(null);

    const currentCollection = useResourceConfig_currentCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const resourceConfig = useResourceConfig_resourceConfig();

    const resourceConfigKeys = Object.keys(resourceConfig);

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: 'Collection',
            renderCell: (params: GridRenderCellParams) => {
                const currentConfig = resourceConfig[params.row];
                if (currentConfig.errors.length > 0) {
                    return (
                        <>
                            <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
                            <ListItemText
                                primary={params.row}
                                primaryTypographyProps={typographyTruncation}
                            />

                            <DeleteButton collection={params.row} />
                        </>
                    );
                }

                return (
                    <>
                        <ListItemText
                            primary={params.row}
                            primaryTypographyProps={typographyTruncation}
                        />

                        <DeleteButton collection={params.row} />
                    </>
                );
            },
            valueGetter: (params: GridValueGetterParams) => params.row,
        },
    ];

    useEffect(() => {
        if (currentCollection) setSelectionModel([currentCollection]);
    }, [currentCollection]);

    useUnmount(() => {
        if (onSelectTimeOut.current) clearTimeout(onSelectTimeOut.current);
    });

    return (
        <>
            <CollectionPicker readOnly={false} />

            <Box sx={{ height: 310 }}>
                <DataGrid
                    components={{
                        NoRowsOverlay: SelectorEmpty,
                    }}
                    rows={resourceConfigKeys}
                    columns={columns}
                    headerHeight={40}
                    rowCount={resourceConfigKeys.length}
                    hideFooter
                    disableColumnSelector
                    onSelectionModelChange={(newSelectionModel) => {
                        setSelectionModel(newSelectionModel);
                    }}
                    onRowClick={(params: any) => {
                        // This is hacky but it works. It clears out the
                        //  current collection before switching.
                        //  If a user is typing quickly in a form and then selects a
                        //  different binding VERY quickly it could cause the updates
                        //  to go into the wrong form.
                        setCurrentCollection(null);
                        onSelectTimeOut.current = window.setTimeout(() => {
                            setCurrentCollection(params.row);
                        });
                    }}
                    getRowId={(resourceConfigKey) => {
                        return resourceConfigKey;
                    }}
                    selectionModel={selectionModel}
                    initialState={initialState}
                    sx={{
                        '& .MuiDataGrid-row ': {
                            cursor: 'pointer',
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                    }}
                />
            </Box>
        </>
    );
}

export default BindingSelector;
