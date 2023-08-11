import {
    Box,
    Checkbox,
    IconButton,
    ListItemText,
    Tooltip,
    useTheme,
} from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import BindingSearch from 'components/collection/BindingSearch';
import CollectionSelectorList from 'components/collection/Selector/List';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { typographyTruncation } from 'context/Theme';
import { useEntityWorkflow } from 'context/Workflow';
import { Cancel, WarningCircle } from 'iconoir-react';
import { ReactNode, useMemo } from 'react';
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
import { hasLength, stripPathing } from 'utils/misc-utils';

interface BindingSelectorProps {
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

interface RowProps {
    collection: string;
    task: string;
    workflow: EntityWorkflow | null;
    disabled: boolean;
    draftId: string | null;
    hideRemove?: boolean;
    shortenName?: boolean;
}

function Row({
    collection,
    disabled,
    draftId,
    hideRemove,
    shortenName,
    task,
    workflow,
}: RowProps) {
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

            if (draftId && !discoveredCollections?.includes(collection)) {
                void deleteDraftSpecsByCatalogName(draftId, 'collection', [
                    collection,
                ]);
            }
        },
    };

    return (
        <>
            <Tooltip title="Enable/Disable Binding">
                <Checkbox
                    disabled={disabled}
                    size="small"
                    onChange={(event) => {
                        event.stopPropagation();
                        console.log('check box clicked on', { event });
                    }}
                />
            </Tooltip>

            <ListItemText
                primary={shortenName ? stripPathing(collection) : collection}
                primaryTypographyProps={typographyTruncation}
            />

            {hideRemove ? null : (
                <IconButton
                    disabled={disabled}
                    size="small"
                    onClick={handlers.removeCollection}
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Cancel />
                </IconButton>
            )}
        </>
    );
}

function BindingSelector({
    itemType,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
    const theme = useTheme();

    const workflow = useEntityWorkflow();
    const entityType = useEntityType();
    const isCapture = entityType === 'capture';

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
    const discoveredCollections = useResourceConfig_discoveredCollections();

    const resourceConfig = useResourceConfig_resourceConfig();
    const removeCollection = useResourceConfig_removeCollection();
    const removeAllCollections = useResourceConfig_removeAllCollections();

    const handlers = {
        removeAllCollections: (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();

            removeAllCollections(workflow, task);

            const publishedCollections =
                discoveredCollections && collections
                    ? collections.filter(
                          (collection) =>
                              !discoveredCollections.includes(collection)
                      )
                    : [];

            if (draftId && publishedCollections.length > 0) {
                void deleteDraftSpecsByCatalogName(
                    draftId,
                    'collection',
                    publishedCollections
                );
            }
        },
    };

    const cellRender = (params: GridRenderCellParams) => {
        const collection = params.row.name;
        const currentConfig = resourceConfig[collection];

        return (
            <>
                {currentConfig.errors.length > 0 ? (
                    <Box>
                        <WarningCircle
                            style={{
                                marginRight: 4,
                                fontSize: 12,
                                color: theme.palette.error.main,
                            }}
                        />
                    </Box>
                ) : null}

                <Row
                    collection={collection}
                    disabled={formActive}
                    draftId={draftId}
                    hideRemove={isCapture}
                    shortenName={isCapture}
                    task={task}
                    workflow={workflow}
                />
            </>
        );
    };

    const rows = useMemo(
        () => new Set(Object.keys(resourceConfig)),
        [resourceConfig]
    );

    const disableActions = formActive || readOnly;

    return (
        <>
            <BindingSearch
                itemType={itemType}
                readOnly={disableActions}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                height="100%"
                header={itemType}
                disableActions={rows.size === 0 || disableActions}
                readOnly={disableActions}
                collections={rows}
                currentCollection={currentCollection}
                setCurrentCollection={setCurrentCollection}
                renderCell={cellRender}
                removeCollection={removeCollection}
                removeAllCollections={
                    !isCapture ? handlers.removeAllCollections : undefined
                }
            />
        </>
    );
}

export default BindingSelector;
