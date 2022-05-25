import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import { EditorStoreState } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

const getRowId = (spec: any) => {
    let newSelectionModel;

    if (spec.id) {
        newSelectionModel = spec.id;
    } else if (spec.draft_id) {
        newSelectionModel = spec.draft_id;
    }

    return `${newSelectionModel}-${spec.catalog_name}`;
};

const columns: GridColDef[] = [
    {
        field: 'catalog_name',
        headerName: 'Files',
        flex: 1,
        renderCell: (params: GridRenderCellParams<Date>) => (
            <ListItemText
                primary={params.row.catalog_name}
                secondary={params.row.spec_type}
            />
        ),
    },
    {
        field: 'spec_type',
        headerName: 'Type',
    },
];

function EditorFileSelector() {
    const setCurrentCatalog = useZustandStore<
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>,
        EditorStoreState<
            PublicationSpecQuery | DraftSpecQuery
        >['setCurrentCatalog']
    >((state) => state.setCurrentCatalog);

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>,
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>['specs']
    >((state) => state.specs);

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    useEffect(() => {
        if (specs) {
            setSelectionModel(getRowId(specs[0]) as any);
        }
    }, [specs]);

    if (specs && specs.length > 0) {
        return (
            <DataGrid
                rows={specs}
                columns={columns}
                headerHeight={40}
                rowCount={specs.length}
                hideFooter
                disableColumnSelector
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                onRowClick={(params: any) => {
                    setCurrentCatalog(params.row);
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

export default EditorFileSelector;
