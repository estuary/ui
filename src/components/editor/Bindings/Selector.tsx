import { Box, IconButton, ListItemText, useTheme } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import CollectionPicker from 'components/collection/Picker';
import CollectionSelectorActions from 'components/collection/Selector/Actions';
import CollectionSelectorList from 'components/collection/Selector/List';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
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

            if (draftId && !discoveredCollections?.includes(collection)) {
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

function BindingSelector({
    loading,
    skeleton,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
    const theme = useTheme();
    const workflow = useEntityWorkflow();

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
    };

    const rows = useMemo(
        () => new Set(Object.keys(resourceConfig)),
        [resourceConfig]
    );

    const disableActions = formActive || readOnly;

    return loading ? (
        <Box>{skeleton}</Box>
    ) : (
        <>
            <CollectionPicker readOnly={disableActions} />

            <CollectionSelectorActions
                readOnly={disableActions ?? rows.size === 0}
                RediscoverButton={RediscoverButton}
                removeAllCollections={handlers.removeAllCollections}
            />

            <CollectionSelectorList
                readOnly={disableActions}
                collections={rows}
                currentCollection={currentCollection}
                setCurrentCollection={setCurrentCollection}
                renderCell={cellRender}
            />
        </>
    );
}

export default BindingSelector;
