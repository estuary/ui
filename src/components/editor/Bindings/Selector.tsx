import {
    Box,
    Button,
    Divider,
    IconButton,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridColumnHeaderParams,
    GridRenderCellParams,
    GridSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import CollectionPicker from 'components/collection/Picker';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import {
    alternativeDataGridHeader,
    defaultOutline,
    typographyTruncation,
} from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';
import { Cancel, WarningCircle } from 'iconoir-react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_currentCollection,
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeAllCollections,
    useResourceConfig_removeCollection,
    useResourceConfig_resourceConfig,
    useResourceConfig_setCurrentCollection,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { EntityWorkflow } from 'types';
import useConstant from 'use-constant';
import { hasLength } from 'utils/misc-utils';

interface BindingSelectorProps {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

interface RowProps {
    collection: string;
    task: string;
    workflow: EntityWorkflow | null;
    disabled: boolean;
    draftId: string | null;
}

function Row({ collection, task, workflow, disabled, draftId }: RowProps) {
    // Resource Config Store
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
                const nativeCollectionDetected = collection.includes(task);

                nativeCollectionDetected
                    ? setRestrictedDiscoveredCollections(
                          collection,
                          nativeCollectionDetected
                      )
                    : setRestrictedDiscoveredCollections(collection);
            } else {
                setRestrictedDiscoveredCollections(collection);
            }

            if (draftId) {
                void deleteDraftSpecsByCatalogName(draftId, 'collection', [
                    collection,
                ]);
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
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <Cancel />
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
    RediscoverButton,
}: BindingSelectorProps) {
    const theme = useTheme();

    const onSelectTimeOut = useRef<number | null>(null);

    const workflow = useEntityWorkflow();

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.listHeader',
        })
    );

    // Details Form Store
    const task = useDetailsForm_details_entityName();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const collections = useResourceConfig_collections();

    const resourceConfig = useResourceConfig_resourceConfig();

    const removeAllCollections = useResourceConfig_removeAllCollections();

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    const handlers = {
        removeAllCollections: (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();

            removeAllCollections(workflow, task);

            if (draftId && collections && collections.length > 0) {
                void deleteDraftSpecsByCatalogName(
                    draftId,
                    'collection',
                    collections
                );
            }
        },
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: collectionsLabel,
            sortable: false,
            renderHeader: (params: GridColumnHeaderParams) => (
                <Typography>{params.colDef.headerName}</Typography>
            ),
            renderCell: (params: GridRenderCellParams) => {
                const collection = params.row.name;
                const currentConfig = resourceConfig[collection];

                if (currentConfig.errors.length > 0) {
                    return (
                        <>
                            <Box>
                                <WarningCircle
                                    style={{
                                        marginRight: 4,
                                        fontSize: 12,
                                        color: theme.palette.error.main,
                                    }}
                                />
                            </Box>

                            <Row
                                collection={collection}
                                task={task}
                                workflow={workflow}
                                disabled={formActive}
                                draftId={draftId}
                            />
                        </>
                    );
                }

                return (
                    <Row
                        collection={collection}
                        task={task}
                        workflow={workflow}
                        disabled={formActive}
                        draftId={draftId}
                    />
                );
            },
            valueGetter: (params: GridValueGetterParams) => params.row.name,
        },
    ];

    const rows = useMemo(
        () =>
            Object.keys(resourceConfig).map((collection) => ({
                id: collection,
                name: collection,
            })),
        [resourceConfig]
    );

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

            <Box
                sx={{
                    ml: 'auto',
                    borderTop: defaultOutline[theme.palette.mode],
                    borderLeft: defaultOutline[theme.palette.mode],
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    divider={
                        RediscoverButton ? (
                            <Divider
                                orientation="vertical"
                                variant="middle"
                                flexItem
                            />
                        ) : null
                    }
                >
                    {RediscoverButton ? RediscoverButton : null}

                    <Button
                        variant="text"
                        disabled={formActive}
                        onClick={handlers.removeAllCollections}
                        sx={{ borderRadius: 0 }}
                    >
                        <FormattedMessage id="workflows.collectionSelector.cta.delete" />
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ height: 480 }}>
                <DataGrid
                    components={{
                        NoRowsOverlay: SelectorEmpty,
                    }}
                    rows={rows}
                    columns={columns}
                    headerHeight={40}
                    rowCount={rows.length}
                    hideFooter
                    disableColumnSelector
                    onRowClick={(params: any) => {
                        // This is hacky but it works. It clears out the
                        //  current collection before switching.
                        //  If a user is typing quickly in a form and then selects a
                        //  different binding VERY quickly it could cause the updates
                        //  to go into the wrong form.
                        setCurrentCollection(null);
                        onSelectTimeOut.current = window.setTimeout(() => {
                            setCurrentCollection(params.row.name);
                        });
                    }}
                    selectionModel={selectionModel}
                    initialState={initialState}
                    sx={{
                        'borderBottom': 'none',
                        '& .MuiDataGrid-row ': {
                            cursor: 'pointer',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: defaultOutline[theme.palette.mode],
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderTop: defaultOutline[theme.palette.mode],
                            borderBottom: defaultOutline[theme.palette.mode],
                            bgcolor:
                                alternativeDataGridHeader[theme.palette.mode],
                        },
                        '& .MuiDataGrid-columnHeader:hover': {
                            '& .MuiDataGrid-columnHeaderTitleContainerContent':
                                {
                                    mr: 0.5,
                                },
                            '& .MuiDataGrid-menuIcon': {
                                width: '2rem',
                            },
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                            width: '100%',
                            justifyContent: 'space-between',
                            mr: 4.5,
                        },
                    }}
                />
            </Box>
        </>
    );
}

export default BindingSelector;
