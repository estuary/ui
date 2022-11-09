import { Clear } from '@mui/icons-material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Box,
    Button,
    ButtonGroup,
    IconButton,
    ListItemText,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import CollectionPicker from 'components/collection/Picker';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import {
    alternativeDataGridHeader,
    slateOutline,
    typographyTruncation,
} from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_currentCollection,
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeAllCollections,
    useResourceConfig_removeCollection,
    useResourceConfig_resourceConfig,
    useResourceConfig_setCurrentCollection,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import { hasLength } from 'utils/misc-utils';

interface BindingSelectorProps {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

interface RowProps {
    collection: string;
    task: string;
    disabled: boolean;
}

function Row({ collection, task, disabled }: RowProps) {
    const workflow = useEntityWorkflow();

    const discoveredCollections = useResourceConfig_discoveredCollections();
    const removeCollection = useResourceConfig_removeCollection();

    const setRestrictedDiscoveredCollections =
        useResourceConfig_setRestrictedDiscoveredCollections();

    const handlers = {
        removeCollection: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            removeCollection(collection);

            if (
                workflow === 'capture_edit' &&
                !hasLength(discoveredCollections)
            ) {
                let catalogName = task;

                const lastSlashIndex = task.lastIndexOf('/');

                if (lastSlashIndex !== -1) {
                    catalogName = task.slice(0, lastSlashIndex);
                }

                const nativeCollectionDetected =
                    collection.includes(catalogName);

                nativeCollectionDetected
                    ? setRestrictedDiscoveredCollections(
                          collection,
                          nativeCollectionDetected
                      )
                    : setRestrictedDiscoveredCollections(collection);
            } else {
                setRestrictedDiscoveredCollections(collection);
            }
        },
    };

    return (
        <>
            <ListItemText
                primary={collection}
                primaryTypographyProps={typographyTruncation}
            />

            <IconButton
                disabled={disabled}
                size="small"
                onClick={handlers.removeCollection}
            >
                <Clear />
            </IconButton>
        </>
    );
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function BindingSelector({
    loading,
    skeleton,
    readOnly,
}: BindingSelectorProps) {
    const onSelectTimeOut = useRef<number | null>(null);

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.listHeader',
        })
    );

    // Details Form Store
    const task = useDetailsForm_details_entityName();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const resourceConfig = useResourceConfig_resourceConfig();
    const discoveredCollections = useResourceConfig_discoveredCollections();

    const setResourceConfig = useResourceConfig_setResourceConfig();
    const removeAllCollection = useResourceConfig_removeAllCollections();

    const resourceConfigKeys = Object.keys(resourceConfig);

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: collectionsLabel,
            renderCell: (params: GridRenderCellParams) => {
                const currentConfig = resourceConfig[params.row];
                if (currentConfig.errors.length > 0) {
                    return (
                        <>
                            <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />

                            <Row
                                collection={params.row}
                                task={task}
                                disabled={formActive}
                            />
                        </>
                    );
                }

                return (
                    <Row
                        collection={params.row}
                        task={task}
                        disabled={formActive}
                    />
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

    return loading ? (
        <Box>{skeleton}</Box>
    ) : (
        <>
            <CollectionPicker readOnly={readOnly} />
            <ButtonGroup
                sx={{
                    flex: 1,
                    display: 'flex',
                }}
                variant="text"
                aria-label="outlined button group"
            >
                <Button
                    sx={{ flex: 1, borderRadius: 0 }}
                    onClick={removeAllCollection}
                >
                    Remove All
                </Button>
                <Button
                    sx={{ flex: 1, borderRadius: 0 }}
                    onClick={() => {
                        setResourceConfig(discoveredCollections ?? []);
                    }}
                >
                    Add All
                </Button>
            </ButtonGroup>

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
                            borderBottom: slateOutline,
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderTop: slateOutline,
                            borderBottom: slateOutline,
                            bgcolor: (theme) =>
                                alternativeDataGridHeader[theme.palette.mode],
                        },
                    }}
                />
            </Box>
        </>
    );
}

export default BindingSelector;
