import type {
    GridColDef,
    GridRenderCellParams,
    GridRowSelectionModel,
} from '@mui/x-data-grid';

import { useEffect, useRef, useState } from 'react';

import { ListItemText } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { FormattedMessage } from 'react-intl';

import {
    useEditorStore_isEditing,
    useEditorStore_isSaving,
    useEditorStore_setCurrentCatalog,
    useEditorStore_specs,
} from 'src/components/editor/Store/hooks';
import { dataGridListStyling } from 'src/context/Theme';

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
        renderCell: (params: GridRenderCellParams) => (
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

    // TODO: Update type LiveSpecsQuery_details | DraftSpecQuery
    const setCurrentCatalog = useEditorStore_setCurrentCatalog({
        localScope: localZustandScope,
    });

    const specs = useEditorStore_specs({ localScope: localZustandScope });

    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        [] as GridRowSelectionModel
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
                columnHeaderHeight={40}
                rowCount={specs.length}
                hideFooter
                disableColumnSelector
                loading={isSaving}
                onRowSelectionModelChange={(newSelectionModel) => {
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
                rowSelectionModel={selectionModel}
                initialState={initialState}
                sx={dataGridListStyling}
            />
        );
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default EditorFileSelector;
