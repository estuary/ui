import { useEntityType } from 'context/EntityContext';
import { useLocalZustandStore } from 'context/LocalZustand';
import { useZustandStore as useGlobalZustandStore } from 'context/Zustand/provider';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import { useEffect } from 'react';
import { EditorStoreNames } from 'stores/names';
import { Entity } from 'types';
import { EditorStoreState } from './types';

interface SelectorParams {
    localScope?: boolean;
}

const storeName = (
    entityType: Entity,
    localScope?: boolean
): EditorStoreNames => {
    if (localScope) {
        return EditorStoreNames.GENERAL;
    } else if (entityType === 'capture') {
        return EditorStoreNames.CAPTURE;
    } else if (entityType === 'materialization') {
        return EditorStoreNames.MATERIALIZATION;
    } else {
        return EditorStoreNames.DERIVATION;
    }
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
    >(storeName(entityType, localScope), (state) => state.id);
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
    >(storeName(entityType, localScope), (state) => state.setId);
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
    >(storeName(entityType, localScope), (state) => state.persistedDraftId);
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
    >(storeName(entityType, localScope), (state) => state.setPersistedDraftId);
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
    >(storeName(entityType, localScope), (state) => state.discoveredDraftId);
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
    >(storeName(entityType, localScope), (state) => state.setDiscoveredDraftId);
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
    >(storeName(entityType, localScope), (state) => state.pubId);
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
    >(storeName(entityType, localScope), (state) => state.setPubId);
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
    >(storeName(entityType, localScope), (state) => state.currentCatalog);
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
    >(storeName(entityType, localScope), (state) => state.setCurrentCatalog);
};

export function useEditorStore_specs<T = DraftSpecQuery | LiveSpecsQuery_spec>(
    params?: SelectorParams | undefined
) {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<EditorStoreState<T>, EditorStoreState<T>['specs']>(
        storeName(entityType, localScope),
        (state) => state.specs
    );
}

export function useEditorStore_setSpecs<
    T = DraftSpecQuery | LiveSpecsQuery_spec,
>(params?: SelectorParams | undefined) {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<T>,
        EditorStoreState<T>['setSpecs']
    >(storeName(entityType, localScope), (state) => state.setSpecs);
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
    >(storeName(entityType, localScope), (state) => state.serverUpdate);
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
    >(storeName(entityType, localScope), (state) => state.setServerUpdate);
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
    >(storeName(entityType, localScope), (state) => state.isSaving);
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
    >(storeName(entityType, localScope), (state) => state.isEditing);
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
    >(storeName(entityType, localScope), (state) => state.statuses);
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
    >(storeName(entityType, localScope), (state) => state.setStatus);
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
    >(storeName(entityType, localScope), (state) => state.invalidEditors);
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
    >(storeName(entityType, localScope), (state) => state.removeStaleStatus);
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
        storeName(entityType, localScope),
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
        storeName(entityType, localScope),
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
    >(storeName(entityType, localScope), (state) => state.queryResponse);
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
    >(storeName(entityType, localScope), (state) => state.setQueryResponse);
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
        storeName(entityType, localScope),
        (state) => state.queryResponse.draftSpecs
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
        storeName(entityType, localScope),
        (state) => state.queryResponse.isValidating
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
    >(storeName(entityType, localScope), (state) => state.queryResponse.mutate);
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
    >(storeName(entityType, localScope), (state) => state.resetState);
};

export const useHydrateEditorState = (
    specType: Entity,
    catalogName?: string,
    localScope?: boolean
) => {
    const draftIdInURL = useGlobalSearchParams(GlobalSearchParams.DRAFT_ID);

    const draftId = useEditorStore_id({ localScope });
    const persistedDraftId = useEditorStore_persistedDraftId({ localScope });
    const setQueryResponse = useEditorStore_setQueryResponse({ localScope });

    // This fallback chain of draft IDs is required because of how the global editor store
    // differs in keeping record of the draft ID from its local counterpart. Notable component
    // call-outs include: the collection tab of the binding selector relies on the draft ID
    // stored in the 'id' property of the local editor store state; the capture auto-discovery settings
    // rely on the draft ID stored in the 'persistedDraftId' property of the global editor store state.
    const response = useDraftSpecs(
        draftId ?? persistedDraftId ?? draftIdInURL,
        {
            specType,
            catalogName,
        }
    );

    useEffect(() => {
        if (!response.isValidating) {
            setQueryResponse(response);
        }
    }, [setQueryResponse, response]);
};
