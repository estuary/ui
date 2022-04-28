import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import { LiveSpecQuery } from 'components/capture/details';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const getRowId = (spec: any) => {
    let newSelectionModel;
    if (spec.id) {
        newSelectionModel = spec.id;
    } else if (spec.draft_id) {
        newSelectionModel = spec.draft_id;
    }

    return `${newSelectionModel}-${spec.catalog_name}`;
};

function EditorFileSelector() {
    const setCurrentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['setCurrentCatalog']
    >((state) => state.setCurrentCatalog);

    const specs = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['specs']
    >((state) => state.specs);

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
                hideFooter
                disableColumnSelector
                onSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                getRowId={getRowId}
                selectionModel={selectionModel}
                onRowClick={(params: any) => {
                    setCurrentCatalog(params.row);
                }}
                headerHeight={40}
                initialState={{
                    columns: {
                        columnVisibilityModel: {
                            spec_type: false,
                        },
                    },
                }}
            />
        );
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default EditorFileSelector;
