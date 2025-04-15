import type { CollectionSelectorCellSettings } from 'src/components/collection/Selector/types';

import { useMemo } from 'react';

import { deleteDraftSpecsByCatalogName } from 'src/api/draftSpecs';
import {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_UUID_COL,
} from 'src/components/collection/Selector/List/shared';
import BindingsSelectorName from 'src/components/editor/Bindings/Row/Name';
import BindingsSelectorRemove from 'src/components/editor/Bindings/Row/Remove';
import BindingsSelectorToggle from 'src/components/editor/Bindings/Row/Toggle';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow } from 'src/context/Workflow';
import {
    useBinding_collections,
    useBinding_discoveredCollections,
    useBinding_removeBindings,
    useBinding_toggleDisable,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { hasLength, splitPathAndName } from 'src/utils/misc-utils';

export function useBindingSelectorCells(): CollectionSelectorCellSettings {
    const workflow = useEntityWorkflow();

    const entityType = useEntityType();
    const isCapture = entityType === 'capture';
    const isCollection = entityType === 'collection';

    const task = useDetailsFormStore((state) => state.details.data.entityName);
    const draftId = useEditorStore_persistedDraftId();

    const collections = useBinding_collections();
    const discoveredCollections = useBinding_discoveredCollections();
    const removeBindings = useBinding_removeBindings();
    const toggleCollections = useBinding_toggleDisable();
    const resetCollectionMetadata = useBindingStore(
        (state) => state.resetCollectionMetadata
    );

    const handlers = useMemo(
        () => ({
            removeBindings: (rows: any[]) => {
                removeBindings(rows, workflow, task);

                if (workflow === 'materialization_edit') {
                    resetCollectionMetadata([], rows);
                }

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
        }),
        [
            collections,
            discoveredCollections,
            draftId,
            removeBindings,
            resetCollectionMetadata,
            task,
            toggleCollections,
            workflow,
        ]
    );

    return useMemo(() => {
        const cellRenderers: CollectionSelectorCellSettings = {
            name: {
                cellRenderer: (params, filterValue) => {
                    const bindingUUID =
                        params.row[COLLECTION_SELECTOR_UUID_COL];
                    const filteringActive = Boolean(filterValue);

                    const collectionParts = filteringActive
                        ? splitPathAndName(
                              params.row[COLLECTION_SELECTOR_NAME_COL]
                          )
                        : isCapture
                          ? [params.row[COLLECTION_SELECTOR_STRIPPED_PATH_NAME]]
                          : [params.row[COLLECTION_SELECTOR_NAME_COL]];

                    return (
                        <BindingsSelectorName
                            bindingUUID={bindingUUID}
                            collection={collectionParts}
                            filterValue={filterValue}
                        />
                    );
                },
            },
        };

        if (!isCapture) {
            cellRenderers.remove = {
                handler: handlers.removeBindings,
                cellRenderer: (params) => {
                    const bindingUUID =
                        params.row[COLLECTION_SELECTOR_UUID_COL];
                    const collection = params.row[COLLECTION_SELECTOR_NAME_COL];

                    return (
                        <BindingsSelectorRemove
                            binding={{ uuid: bindingUUID, collection }}
                            task={task}
                            draftId={draftId}
                        />
                    );
                },
            };
        }

        if (!isCollection) {
            cellRenderers.toggle = {
                handler: handlers.toggleCollections,
                cellRenderer: (params) => {
                    const bindingUUID =
                        params.row[COLLECTION_SELECTOR_UUID_COL];

                    return <BindingsSelectorToggle bindingUUID={bindingUUID} />;
                },
            };
        }

        return cellRenderers;
    }, [isCapture, isCollection, handlers, task, draftId]);
}
