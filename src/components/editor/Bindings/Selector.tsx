import { Clear } from '@mui/icons-material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Box,
    Button,
    Divider,
    IconButton,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridColumnHeaderParams,
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
import { FormattedMessage, useIntl } from 'react-intl';
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
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { EntityWorkflow } from 'types';
import useConstant from 'use-constant';
import { hasLength, truncateCatalogName } from 'utils/misc-utils';

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
}

function Row({ collection, task, workflow, disabled }: RowProps) {
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
                const catalogName = truncateCatalogName(task);

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
    RediscoverButton,
}: BindingSelectorProps) {
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

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const resourceConfig = useResourceConfig_resourceConfig();

    const removeAllCollections = useResourceConfig_removeAllCollections();

    const resourceConfigKeys = Object.keys(resourceConfig);

    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    const handlers = {
        removeAllCollections: (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();

            removeAllCollections(workflow, task);
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
                const currentConfig = resourceConfig[params.row];
                if (currentConfig.errors.length > 0) {
                    return (
                        <>
                            <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />

                            <Row
                                collection={params.row}
                                task={task}
                                workflow={workflow}
                                disabled={formActive}
                            />
                        </>
                    );
                }

                return (
                    <Row
                        collection={params.row}
                        task={task}
                        workflow={workflow}
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

            <Box
                sx={{
                    ml: 'auto',
                    borderTop: slateOutline,
                    borderLeft: slateOutline,
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
