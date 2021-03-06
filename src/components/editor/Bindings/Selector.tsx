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
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import { entityCreateStoreSelectors } from 'stores/Create';

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function BindingSelector() {
    const onSelectTimeOut = useRef<number | null>(null);

    const useEntityCreateStore = useRouteStore();
    const currentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.collections.current.get
    );
    const setCurrentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.collections.current.set
    );
    const resourceConfig = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );
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
        if (!isEmpty(currentCollection)) setSelectionModel(currentCollection);
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
