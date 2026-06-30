import type { EditorStoreState } from 'src/components/editor/Store/types';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { Entity } from 'src/types';

import { useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useEntityType } from 'src/context/EntityContext';
import { useLocalZustandStore } from 'src/context/LocalZustand';
import { useZustandStore as useGlobalZustandStore } from 'src/context/Zustand/provider';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDraftSpecs_forEditor } from 'src/hooks/useDraftSpecs';
import { useBindingStore } from 'src/stores/Binding/Store';
import { EditorStoreNames } from 'src/stores/names';
import useCollectionsHydrator from 'src/stores/Workflow/slices/useCollectionsHydrator';
import { hasLength } from 'src/utils/misc-utils';
import { getBindingIndex } from 'src/utils/workflow-utils';

interface SelectorParams {
    localScope?: boolean;
}

export const useStoreName = (
    entityType: Entity,
    localScope?: boolean
): EditorStoreNames => {
    return useMemo(() => {
        if (localScope) {
            return EditorStoreNames.GENERAL;
        } else if (entityType === 'capture') {
            return EditorStoreNames.CAPTURE;
        } else if (entityType === 'materialization') {
            return EditorStoreNames.MATERIALIZATION;
        } else {
            return EditorStoreNames.DERIVATION;
        }
    }, [entityType, localScope]);
};

export const useEditorStore_id = (params?: SelectorParams | undefined) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(useStoreName(entityType, localScope), (state) => state.id);
};

export const useEditorStore_setId = (params?: SelectorParams | undefined) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(useStoreName(entityType, localScope), (state) => state.setId);
};

export const useEditorStore_persistedDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['persistedDraftId']
    >(useStoreName(entityType, localScope), (state) => state.persistedDraftId);
};

export const useEditorStore_setPersistedDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPersistedDraftId']
    >(
        useStoreName(entityType, localScope),
        (state) => state.setPersistedDraftId
    );
};

export const useEditorStore_discoveredDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['discoveredDraftId']
    >(useStoreName(entityType, localScope), (state) => state.discoveredDraftId);
};

export const useEditorStore_setDiscoveredDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setDiscoveredDraftId']
    >(
        useStoreName(entityType, localScope),
        (state) => state.setDiscoveredDraftId
    );
};

export const useEditorStore_pubId = (params?: SelectorParams | undefined) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >(useStoreName(entityType, localScope), (state) => state.pubId);
};

export const useEditorStore_setPubId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPubId']
    >(useStoreName(entityType, localScope), (state) => state.setPubId);
};

export const useEditorStore_currentCatalog = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['currentCatalog']
    >(useStoreName(entityType, localScope), (state) => state.currentCatalog);
};

export const useEditorStore_catalogName = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['catalogName']
    >(useStoreName(entityType, localScope), (state) => state.catalogName);
};

export const useEditorStore_setCatalogName = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setCatalogName']
    >(useStoreName(entityType, localScope), (state) => state.setCatalogName);
};

export const useEditorStore_setCurrentCatalog = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setCurrentCatalog']
    >(useStoreName(entityType, localScope), (state) => state.setCurrentCatalog);
};

export function useEditorStore_specs<
    T = DraftSpecQuery | LiveSpecsQuery_details,
>(params?: SelectorParams | undefined) {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<EditorStoreState<T>, EditorStoreState<T>['specs']>(
        useStoreName(entityType, localScope),
        (state) => state.specs
    );
}

export function useEditorStore_setSpecs<
    T = DraftSpecQuery | LiveSpecsQuery_details,
>(params?: SelectorParams | undefined) {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<T>,
        EditorStoreState<T>['setSpecs']
    >(useStoreName(entityType, localScope), (state) => state.setSpecs);
}

export const useEditorStore_serverUpdate = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['serverUpdate']
    >(useStoreName(entityType, localScope), (state) => state.serverUpdate);
};

export const useEditorStore_setServerUpdate = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setServerUpdate']
    >(useStoreName(entityType, localScope), (state) => state.setServerUpdate);
};

export const useEditorStore_isSaving = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(useStoreName(entityType, localScope), (state) => state.isSaving);
};

export const useEditorStore_isEditing = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isEditing']
    >(useStoreName(entityType, localScope), (state) => state.isEditing);
};

export const useEditorStore_statuses = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['statuses']
    >(useStoreName(entityType, localScope), (state) => state.statuses);
};

export const useEditorStore_setStatus = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setStatus']
    >(useStoreName(entityType, localScope), (state) => state.setStatus);
};

export const useEditorStore_invalidEditors = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['invalidEditors']
    >(useStoreName(entityType, localScope), (state) => state.invalidEditors);
};

export const useEditorStore_removeStaleStatus = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['removeStaleStatus']
    >(useStoreName(entityType, localScope), (state) => state.removeStaleStatus);
};

export const useEditorStore_draftInitializationError = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['draftInitializationError']
    >(
        useStoreName(entityType, localScope),
        (state) => state.draftInitializationError
    );
};

export const useEditorStore_setDraftInitializationError = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setDraftInitializationError']
    >(
        useStoreName(entityType, localScope),
        (state) => state.setDraftInitializationError
    );
};

export const useEditorStore_queryResponse = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['queryResponse']
    >(useStoreName(entityType, localScope), (state) => state.queryResponse);
};

export const useEditorStore_setQueryResponse = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setQueryResponse']
    >(useStoreName(entityType, localScope), (state) => state.setQueryResponse);
};

export const useEditorStore_queryResponse_draftSpecs = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['queryResponse']['draftSpecs']
    >(
        useStoreName(entityType, localScope),
        (state) => state.queryResponse.draftSpecs
    );
};

export const useEditorStore_queryResponse_draftSpecs_schemaProp = (
    bindingIndex: number,
    schemaProp: string,
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<EditorStoreState<DraftSpecQuery>, any>(
        useStoreName(entityType, localScope),
        useShallow((state) => {
            return bindingIndex > -1
                ? state.queryResponse.draftSpecs[0]?.spec.bindings[
                      bindingIndex
                  ][schemaProp]
                : undefined;
        })
    );
};

export const useEditorStore_queryResponse_isValidating = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['queryResponse']['isValidating']
    >(
        useStoreName(entityType, localScope),
        useShallow((state) => state.queryResponse.isValidating)
    );
};

export const useEditorStore_queryResponse_mutate = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['queryResponse']['mutate']
    >(
        useStoreName(entityType, localScope),
        useShallow((state) => state.queryResponse.mutate)
    );
};

// TODO - look into this -1 response
export const useEditorStore_queryResponse_draftedBindingIndex = (
    collection: string | null,
    targetBindingIndex: number
) => {
    const entityType = useEntityType();

    return useGlobalZustandStore<EditorStoreState<DraftSpecQuery>, number>(
        useStoreName(entityType),
        useShallow((state) =>
            collection && hasLength(state.queryResponse.draftSpecs)
                ? getBindingIndex(
                      state.queryResponse.draftSpecs[0].spec.bindings,
                      collection,
                      targetBindingIndex
                  )
                : -1
        )
    );
};

export const useEditorStore_resetState = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['resetState']
    >(useStoreName(entityType, localScope), (state) => state.resetState);
};

export const useEditorStore_liveBuiltSpec = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['liveBuiltSpec']
    >(useStoreName(entityType, localScope), (state) => state.liveBuiltSpec);
};

export const useEditorStore_setLiveBuiltSpec = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setLiveBuiltSpec']
    >(useStoreName(entityType, localScope), (state) => state.setLiveBuiltSpec);
};

export const useHydrateEditorState = (
    specType: Entity,
    catalogName?: string,
    localScope?: boolean
) => {
    const draftIdInURL = useGlobalSearchParams(GlobalSearchParams.DRAFT_ID);

    const setRelatedBindingIndices = useBindingStore(
        (state) => state.setRelatedBindingIndices
    );

    const hydrateCollections = useCollectionsHydrator();

    const draftId = useEditorStore_id({ localScope });
    const persistedDraftId = useEditorStore_persistedDraftId({ localScope });
    const setQueryResponse = useEditorStore_setQueryResponse({ localScope });
    const liveBuiltSpec = useEditorStore_liveBuiltSpec({ localScope });

    // This fallback chain of draft IDs is required because of how the global editor store
    // differs in keeping record of the draft ID from its local counterpart. Notable component
    // call-outs include: the collection tab of the binding selector relies on the draft ID
    // stored in the 'id' property of the local editor store state; the capture auto-discovery settings
    // rely on the draft ID stored in the 'persistedDraftId' property of the global editor store state.
    const response = useDraftSpecs_forEditor(
        draftId ?? persistedDraftId ?? draftIdInURL,
        specType,
        catalogName
    );

    useEffect(() => {
        if (!response.isValidating) {
            setQueryResponse(response);

            if (response.draftSpecs.length > 0) {
                setRelatedBindingIndices(
                    response.draftSpecs[0].built_spec,
                    response.draftSpecs[0].validated,
                    liveBuiltSpec
                );

                // TODO (draft init / workflow)
                // This is hacky - but will work for now. We need to know about
                //  all the collections on the draft so we want to wait for a draftedSpec
                //  to be available to us. This means we have to wait until we know 100%
                //  we have one. This is a pain when trying to hydrateCollections higher up
                //  in the WorkFlow hydrator
                void hydrateCollections(
                    response.draftSpecs[0].draft_id,
                    response.draftSpecs[0].spec
                );
            }
        }
    }, [
        liveBuiltSpec,
        setQueryResponse,
        setRelatedBindingIndices,
        response,
        hydrateCollections,
    ]);
};
