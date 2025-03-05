import { Box } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import CollectionSelectorList from 'components/collection/Selector/List';
import {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_UUID_COL,
} from 'components/collection/Selector/List/shared';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { ReactNode } from 'react';
import {
    useBinding_collections,
    useBinding_discoveredCollections,
    useBinding_removeBindings,
    useBinding_setCurrentBinding,
    useBinding_toggleDisable,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';
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
    const task = useDetailsFormStore((state) => state.details.data.entityName);

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Binding Store
    const setCurrentBinding = useBinding_setCurrentBinding();
    const collections = useBinding_collections();
    const discoveredCollections = useBinding_discoveredCollections();
    const removeBindings = useBinding_removeBindings();
    const toggleCollections = useBinding_toggleDisable();
    const resetCollectionMetadata = useBindingStore(
        (state) => state.resetCollectionMetadata
    );

    const handlers = {
        removeBindings: (rows: any[]) => {
            removeBindings(rows, workflow, task);
            resetCollectionMetadata([], rows);

            const publishedCollections =
                hasLength(discoveredCollections) && hasLength(collections)
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
        toggleCollections: (rows: any[] | null, value: boolean) =>
            toggleCollections(rows, value),
    };

    const disableActions = formActive || readOnly;

    const cellRenderers = {
        name: (params: GridRenderCellParams) => {
            const bindingUUID = params.row[COLLECTION_SELECTOR_UUID_COL];

            return (
                <BindingsSelectorName
                    bindingUUID={bindingUUID}
                    collection={params.value}
                />
            );
        },
        remove: (params: GridRenderCellParams) => {
            if (isCapture) {
                return null;
            }

            const bindingUUID = params.row[COLLECTION_SELECTOR_UUID_COL];
            const collection = params.row[COLLECTION_SELECTOR_NAME_COL];

            return (
                <BindingsSelectorRemove
                    binding={{ uuid: bindingUUID, collection }}
                    task={task}
                    disabled={formActive}
                    draftId={draftId}
                />
            );
        },
        toggle: (params: GridRenderCellParams) => {
            const bindingUUID = params.row[COLLECTION_SELECTOR_UUID_COL];

            return (
                <BindingsSelectorToggle
                    bindingUUID={bindingUUID}
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
                setCurrentBinding={
                    !disableSelect ? setCurrentBinding : undefined
                }
                renderers={{
                    cell: cellRenderers,
                }}
                removeCollections={
                    !isCapture ? handlers.removeBindings : undefined
                }
                toggleCollections={
                    !isCollection ? handlers.toggleCollections : undefined
                }
            />
        </Box>
    );
}

export default BindingSelector;
