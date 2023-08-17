import { Box, useTheme } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import CollectionSelectorList from 'components/collection/Selector/List';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { WarningCircle } from 'iconoir-react';
import { ReactNode } from 'react';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeAllCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_setCurrentCollection,
} from 'stores/ResourceConfig/hooks';
import BindingsSelectorName from './Row/Name';
import BindingsSelectorRemove from './Row/Remove';
import BindingsSelectorToggle from './Row/Toggle';
import BindingSearch from './Search';

interface BindingSelectorProps {
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
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
    const isCollection = entityType === 'collection';

    // Details Form Store
    const task = useDetailsForm_details_entityName();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
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
        toggleAllCollections: (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();

            console.log('toggle all collections here');
        },
    };

    const disableActions = formActive || readOnly;

    const cellRenderers = {
        name: (params: GridRenderCellParams) => {
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

                    <BindingsSelectorName
                        collection={collection}
                        shortenName={isCapture}
                    />
                </>
            );
        },
        remove: (params: GridRenderCellParams) => {
            if (isCapture) {
                return null;
            }

            const collection = params.row.name;

            return (
                <BindingsSelectorRemove
                    collection={collection}
                    task={task}
                    disabled={formActive}
                    draftId={draftId}
                />
            );
        },
        toggle: (params: GridRenderCellParams) => {
            const collection = params.row.name;

            return (
                <BindingsSelectorToggle
                    collection={collection}
                    disableButton={formActive}
                />
            );
        },
    };

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
                disableActions={disableActions}
                setCurrentCollection={setCurrentCollection}
                renderers={{
                    cell: cellRenderers,
                }}
                removeAllCollections={
                    !isCapture ? handlers.removeAllCollections : undefined
                }
                toggleAllCollections={
                    !isCollection ? handlers.removeAllCollections : undefined
                }
            />
        </>
    );
}

export default BindingSelector;
