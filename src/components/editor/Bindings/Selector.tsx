import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import {
    ResourceConfigState,
    useResourceConfig_currentCollection,
    useResourceConfig_setCurrentCollection,
} from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function BindingSelector({ resourceConfigStoreName }: Props) {
    const onSelectTimeOut = useRef<number | null>(null);

    const currentCollection = useResourceConfig_currentCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const resourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(resourceConfigStoreName, (state) => state.resourceConfig);

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
                            <ListItemText primary={params.row} />
                        </>
                    );
                }

                return <ListItemText primary={params.row} />;
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
    );
}

export default BindingSelector;
