import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
        field: 'row',
        flex: 1,
        headerName: 'Collection',
        renderCell: (params: GridRenderCellParams) => (
            <ListItemText primary={params.row} />
        ),
    },
    {
        field: 'spec_type',
        headerName: 'Type',
    },
];

function BindingSelector() {
    const initDone = useRef(false);

    const useEntityCreateStore = useRouteStore();
    const collections = useEntityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const currentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.currentCollection
    );
    const setCurrentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.setCurrentCollection
    );

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    useEffect(() => {
        if (!initDone.current && collections.length > 0) {
            initDone.current = true;
            setSelectionModel(getRowId(collections[0]));
        }
    }, [initDone, collections]);

    useEffect(() => {
        if (!isEmpty(currentCollection)) setSelectionModel(currentCollection);
    }, [currentCollection]);

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
                // onSelectionModelChange={(newSelectionModel) => {
                //     setSelectionModel(newSelectionModel);
                // }}
                onRowClick={(params: any) => {
                    setCurrentCollection(params.row);
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
