import { ListItemText } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
} from '@mui/x-data-grid';
import {
    useEditorStore_isEditing,
    useEditorStore_isSaving,
    useEditorStore_setCurrentCatalog,
    useEditorStore_specs,
} from 'components/editor/Store/hooks';
import { slate } from 'context/Theme';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    localZustandScope: boolean;
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

function EditorFileSelector({ localZustandScope }: Props) {
    const initDone = useRef(false);

    const isSaving = useEditorStore_isSaving({ localScope: localZustandScope });

    const isEditing = useEditorStore_isEditing({
        localScope: localZustandScope,
    });

    // TODO: Update type LiveSpecsQuery_spec | DraftSpecQuery
    const setCurrentCatalog = useEditorStore_setCurrentCatalog({
        localScope: localZustandScope,
    });

    const specs = useEditorStore_specs({ localScope: localZustandScope });

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
                onSelectionModelChange={(newSelectionModel) => {
                    if (!isEditing) {
                        setSelectionModel(newSelectionModel);
                    }
                }}
                onRowClick={(params: any) => {
                    if (!isEditing) {
                        setCurrentCatalog(params.row);
                    }
                }}
                getRowId={getRowId}
                selectionModel={selectionModel}
                initialState={initialState}
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: `1px solid ${slate[200]}`,
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        borderBottom: `1px solid ${slate[200]}`,
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    'border': `1px solid ${slate[200]}`,
                }}
            />
        );
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default EditorFileSelector;
