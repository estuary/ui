import type { CollectionSelectorCellSettings } from 'src/components/collection/Selector/types';
import type { BindingMetadata } from 'src/stores/Binding/types';

import { useMemo } from 'react';

import { deleteDraftSpecsByCatalogName } from 'src/api/draftSpecs';
import {
    COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS,
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_UUID_COL,
} from 'src/components/collection/Selector/List/shared';
import BindingsSelectorErrorIndicator from 'src/components/editor/Bindings/Row/ErrorIndicator';
import BindingsSelectorName from 'src/components/editor/Bindings/Row/Name';
import BindingsSelectorRemove from 'src/components/editor/Bindings/Row/Remove';
import BindingsSelectorToggle from 'src/components/editor/Bindings/Row/Toggle';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow } from 'src/context/Workflow';
import useDisableUpdater from 'src/hooks/bindings/useDisableUpdater';
import {
    useBinding_collections,
    useBinding_discoveredCollections,
    useBinding_removeBindings,
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

    const { updateDraft } = useDisableUpdater();
    const collections = useBinding_collections();
    const discoveredCollections = useBinding_discoveredCollections();
    const removeBindings = useBinding_removeBindings();
    const resetCollectionMetadata = useBindingStore(
        (state) => state.resetCollectionMetadata
    );

    const handlers = useMemo(
        () => ({
            removeBindings: async (rows: BindingMetadata[]) => {
                removeBindings(rows, workflow, task);

                if (workflow === 'materialization_edit') {
                    resetCollectionMetadata(
                        rows.map((datum) => datum.collection),
                        rows.map((datum) => datum.uuid)
                    );
                }

                // TODO (What are we doing?)
                // I have no clue why we are cleaning collections up like this
                //  Should probably work like `removeBinding` where we remove from draft
                //  FIRST. Also, should be cleaning up collections that are being removed
                const publishedCollections =
                    hasLength(discoveredCollections) && hasLength(collections)
                        ? collections.filter(
                              (collection) =>
                                  !discoveredCollections.includes(collection)
                          )
                        : [];

                if (draftId && publishedCollections.length > 0) {
                    await deleteDraftSpecsByCatalogName(
                        draftId,
                        'collection',
                        publishedCollections
                    );
                }
            },
            toggleCollections: async (rows: any[] | null, value: boolean) =>
                updateDraft(rows, value),
        }),
        [
            collections,
            discoveredCollections,
            draftId,
            removeBindings,
            resetCollectionMetadata,
            task,
            updateDraft,
            workflow,
        ]
    );

    // TODO (collection selector)
    //  We should make this return an object where the keys match the `COLLECTION_SELECTOR_...` props set as `field` on the columns
    return useMemo(() => {
        const cellRenderers: CollectionSelectorCellSettings = {
            name: {
                cellRenderer: (params, filterValue) => {
                    const filteringActive = Boolean(filterValue);

                    const collectionParts = filteringActive
                        ? splitPathAndName(
                              params.row[COLLECTION_SELECTOR_NAME_COL]
                          )
                        : isCapture
                          ? [params.row[COLLECTION_SELECTOR_STRIPPED_PATH_NAME]]
                          : [params.row[COLLECTION_SELECTOR_NAME_COL]];

                    // This is kinda gross - but it is better than constantly resetting this value
                    //    after the filter value is removed.
                    const highlightChunks = filteringActive
                        ? params.row[COLLECTION_SELECTOR_HIGHLIGHT_CHUNKS]
                        : [];

                    return (
                        <BindingsSelectorName
                            collection={collectionParts}
                            filterValue={filterValue}
                            highlightChunks={highlightChunks}
                            buttonProps={{
                                startIcon: isCollection ? undefined : (
                                    <BindingsSelectorErrorIndicator
                                        bindingUUID={
                                            params.row[
                                                COLLECTION_SELECTOR_UUID_COL
                                            ]
                                        }
                                        collection={
                                            params.row[
                                                COLLECTION_SELECTOR_NAME_COL
                                            ]
                                        }
                                    />
                                ),
                            }}
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
                    return (
                        <BindingsSelectorToggle
                            bindingUUID={
                                params.row[COLLECTION_SELECTOR_UUID_COL]
                            }
                        />
                    );
                },
            };
        }

        return cellRenderers;
    }, [isCapture, isCollection, handlers, task, draftId]);
}
