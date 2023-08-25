import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import CollectionSelectorList from 'components/collection/Selector/List';
import { COLLECTION_SELECTOR_NAME_COL } from 'components/collection/Selector/List/shared';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { ReactNode } from 'react';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeCollections,
    useResourceConfig_setCurrentCollection,
    useResourceConfig_toggleDisable,
} from 'stores/ResourceConfig/hooks';
import BindingsSelectorName from './Row/Name';
import BindingsSelectorRemove from './Row/Remove';
import BindingsSelectorToggle from './Row/Toggle';
import BindingSearch from './Search';

interface BindingSelectorProps {
    disableSelect?: boolean;
    height?: number | string;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function BindingSelector({
    disableSelect,
    height,
    itemType,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
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

    const removeCollections = useResourceConfig_removeCollections();
    const toggleCollections = useResourceConfig_toggleDisable();

    const handlers = {
        removeCollections: (rows: any[]) => {
            removeCollections(rows, workflow, task);

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
        toggleCollections: (rows: any[], value: boolean) => {
            toggleCollections(rows, value);
        },
    };

    const disableActions = formActive || readOnly;

    const cellRenderers = {
        name: (params: GridRenderCellParams) => {
            const collection = params.row[COLLECTION_SELECTOR_NAME_COL];

            return (
                <BindingsSelectorName
                    collection={collection}
                    shortenName={isCapture}
                />
            );
        },
        remove: (params: GridRenderCellParams) => {
            if (isCapture) {
                return null;
            }

            const collection = params.row[COLLECTION_SELECTOR_NAME_COL];

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
            const collection = params.row[COLLECTION_SELECTOR_NAME_COL];

            return (
                <BindingsSelectorToggle
                    collection={collection}
                    disableButton={formActive}
                />
            );
        },
    };

    return (
        <Box
            sx={{
                height,
            }}
        >
            <BindingSearch
                itemType={itemType}
                readOnly={disableActions}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                height="100%"
                header={itemType}
                disableActions={disableActions}
                setCurrentCollection={
                    !disableSelect ? setCurrentCollection : undefined
                }
                renderers={{
                    cell: cellRenderers,
                }}
                removeCollections={
                    !isCapture ? handlers.removeCollections : undefined
                }
                toggleCollections={
                    !isCollection ? handlers.toggleCollections : undefined
                }
            />
        </Box>
    );
}

export default BindingSelector;
