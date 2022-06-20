import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import { EditorStoreState } from 'components/editor/Store';
import {
    DraftEditorStoreNames,
    LiveSpecEditorStoreNames,
    UseZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    editorStoreName: DraftEditorStoreNames | LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
}

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

function EditorFileSelector({ editorStoreName, useZustandStore }: Props) {
    const initDone = useRef(false);

    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(editorStoreName, (state) => state.isSaving);

    const isEditing = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isEditing']
    >(editorStoreName, (state) => state.isEditing);

    const setCurrentCatalog = useZustandStore<
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>,
        EditorStoreState<
            PublicationSpecQuery | DraftSpecQuery
        >['setCurrentCatalog']
    >(editorStoreName, (state) => state.setCurrentCatalog);

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>,
        EditorStoreState<PublicationSpecQuery | DraftSpecQuery>['specs']
    >(editorStoreName, (state) => state.specs);

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    useEffect(() => {
        if (!initDone.current && specs) {
            initDone.current = true;
            setSelectionModel(getRowId(specs[0]) as any);
        }
    }, [initDone, specs]);

    if (specs && specs.length > 0) {
        return (
            <DataGrid
                rows={specs}
                columns={columns}
                headerHeight={40}
                rowCount={specs.length}
                hideFooter
                disableColumnSelector
                loading={isSaving}
                onSelectionModelChange={(newSelectionModel, details) => {
                    console.log('Selection model', {
                        newSelectionModel,
                        details,
                    });
                    if (!isEditing) {
                        setSelectionModel(newSelectionModel);
                    }
                }}
                onRowClick={(params: any) => {
                    console.log('file clicked', params);
                    if (!isEditing) {
                        setCurrentCatalog(params.row);
                    }
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
