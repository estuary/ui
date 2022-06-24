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
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { entityCreateStoreSelectors } from 'stores/Create';

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

const getRowId = (collectionName: any) => {
    return collectionName;
};

const columns: GridColDef[] = [
    {
        field: 'name',
        flex: 1,
        headerName: 'Collection',
        renderCell: (params: GridRenderCellParams) => (
            <ListItemText primary={params.row} />
        ),
        valueGetter: (params: GridValueGetterParams) => params.row,
    },
];

function BindingSelector() {
    const onSelectTimeOut = useRef<number | null>(null);

    const useEntityCreateStore = useRouteStore();
    const collections = useEntityCreateStore(
        entityCreateStoreSelectors.collections.get
    );
    const currentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.collections.current.get
    );
    const setCurrentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.collections.current.set
    );

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    useEffect(() => {
        if (!isEmpty(currentCollection)) setSelectionModel(currentCollection);
    }, [currentCollection]);

    useUnmount(() => {
        if (onSelectTimeOut.current) clearTimeout(onSelectTimeOut.current);
    });

    if (collections) {
        return (
            <DataGrid
                components={{
                    NoRowsOverlay: SelectorEmpty,
                }}
                rows={collections}
                columns={columns}
                headerHeight={40}
                rowCount={collections.length}
                hideFooter
                disableColumnSelector
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                onRowClick={(params: any) => {
                    setCurrentCollection(null);

                    // This is hacky but it works. I thin kwe should find a more
                    //  elegant solution. This is here so that we clear out the
                    //  current collection before switching.
                    //  If a user is typing quickly in a form and then selects a
                    //  different binding VERY quickly it could cause the updates
                    //  to go into the wrong form.
                    onSelectTimeOut.current = window.setTimeout(() => {
                        setCurrentCollection(params.row);
                    });
                }}
                getRowId={getRowId}
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
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default BindingSelector;
