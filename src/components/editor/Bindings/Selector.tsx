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
import { alternativeDataGridHeader, slate, slateOutline } from 'context/Theme';
import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import { useFormStateStore_isActive } from 'stores/FormState';
import {
    useResourceConfig_currentCollection,
    useResourceConfig_removeCollection,
    useResourceConfig_resourceConfig,
    useResourceConfig_setCurrentCollection,
} from 'stores/ResourceConfig';

interface BindingSelectorProps {
    readOnly?: boolean;
}

interface DeleteButtonProps {
    collection: string;
    disabled: boolean;
}

function DeleteButton({ collection, disabled }: DeleteButtonProps) {
    const removeCollection = useResourceConfig_removeCollection();

    const handlers = {
        removeCollection: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            removeCollection(collection);
        },
    };

    return (
        <IconButton
            disabled={disabled}
            size="small"
            onClick={handlers.removeCollection}
        >
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

function BindingSelector({ readOnly }: BindingSelectorProps) {
    const onSelectTimeOut = useRef<number | null>(null);

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
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
            headerName: 'Collections',
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

                            <DeleteButton
                                collection={params.row}
                                disabled={formActive}
                            />
                        </>
                    );
                }

                return (
                    <>
                        <ListItemText
                            primary={params.row}
                            primaryTypographyProps={typographyTruncation}
                        />

                        <DeleteButton
                            collection={params.row}
                            disabled={formActive}
                        />
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
            <CollectionPicker readOnly={readOnly} />

            <Box sx={{ height: 280 }}>
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
                        'borderBottom': 'none',
                        '& .MuiDataGrid-row ': {
                            cursor: 'pointer',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: slateOutline[200],
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderBottom: slateOutline[200],
                            bgcolor: (theme) =>
                                alternativeDataGridHeader[theme.palette.mode],
                        },
                        '& .MuiDataGrid-columnHeaderTitle, & .MuiDataGrid-columnHeaders .MuiButtonBase-root':
                            {
                                color: slate[800],
                            },
                    }}
                />
            </Box>
        </>
    );
}

export default BindingSelector;
