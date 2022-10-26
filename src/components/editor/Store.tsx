import { useEntityType } from 'context/EntityContext';
import { useLocalZustandStore } from 'context/LocalZustand';
import {
    EditorStoreNames,
    useZustandStore as useGlobalZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import produce from 'immer';
import { ENTITY } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export enum EditorStatus {
    IDLE = 'nothing happened since load',
    EDITING = 'user typing',
    INVALID = 'editor value not parsable',
    SAVING = 'calling server to save changes',
    SAVED = 'changes saved to server',
    SAVE_FAILED = 'calling server failed',
    OUT_OF_SYNC = 'there are changes on server that client needs to merge',
}

export const isEditorActive = (status: EditorStatus) => {
    return status === EditorStatus.SAVING;
};

export interface EditorStoreState<T> {
    id: string | null;
    setId: (newVal: EditorStoreState<T>['id']) => void;

    // TODO (naming): Rename this property and its related action to persistedDraftId
    //   or something unrelated to a workflow. The create workflow now makes use of this value.
    editDraftId: string | null;
    setEditDraftId: (newVal: EditorStoreState<T>['editDraftId']) => void;

    pubId: string | null;
    setPubId: (newVal: EditorStoreState<T>['pubId']) => void;

    // TODO: Resolve conflicting type. Determine whether current catalog can be a DraftSpecQuery, LiveSpecsQuery_spec, or null.
    //   See the FileSelector component for reference.
    currentCatalog: DraftSpecQuery | null;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    specs: T[] | null;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;

    // TODO: Confirm that a server update will always be a DraftSpecQuery.
    serverUpdate: any | null;
    setServerUpdate: (newVal: EditorStoreState<T>['serverUpdate']) => void;

    isSaving: boolean;
    isEditing: boolean;
    status: EditorStatus;
    setStatus: (newVal: EditorStatus) => void;

    resetState: (excludeEditDraftId?: boolean) => void;
}

const getInitialStateData = () => {
    return {
        currentCatalog: null,
        id: null,
        editDraftId: null,
        pubId: null,
        specs: null,
        isSaving: false,
        isEditing: false,
        status: EditorStatus.IDLE,
        serverUpdate: null,
    };
};

const getInitialState = <T,>(
    set: NamedSet<EditorStoreState<T>>
): EditorStoreState<T> => {
    return {
        ...getInitialStateData(),
        setId: (newVal) => {
            set(
                produce((state) => {
                    state.id = newVal;
                }),
                false,
                'Set draft id'
            );
        },

        setEditDraftId: (newVal) => {
            set(
                produce((state) => {
                    state.editDraftId = newVal;
                }),
                false,
                'Set edit draft id'
            );
        },

        setPubId: (newVal) => {
            set(
                produce((state) => {
                    state.pubId = newVal;
                }),
                false,
                'Set publication id'
            );
        },

        setCurrentCatalog: (newVal) => {
            set(
                produce((state) => {
                    state.currentCatalog = newVal;
                    state.status = EditorStatus.IDLE;
                }),
                false,
                'Setting current catalog'
            );
        },

        setSpecs: (newVal) => {
            set(
                produce((state) => {
                    if (newVal && newVal.length > 0) {
                        if (state.specs === null || newVal.length === 1) {
                            state.currentCatalog = newVal[0];
                        }

                        state.specs = newVal;
                    }
                }),
                false,
                'Set specs'
            );
        },

        setServerUpdate: (newVal) => {
            set(
                produce((state) => {
                    state.serverUpdate = newVal;
                }),
                false,
                'Set server update'
            );
        },

        setStatus: (newVal) => {
            set(
                produce((state) => {
                    state.isSaving = newVal === EditorStatus.SAVING;
                    state.isEditing = newVal === EditorStatus.EDITING;
                    state.status = newVal;
                }),
                false,
                'Setting status'
            );
        },

        // This is a hacky, temporary solution to preserve the edit draft ID
        // when the discovery operation is run in the capture edit workflow.
        resetState: (excludeEditDraftId) => {
            set(
                () => {
                    const { editDraftId, ...rest } = getInitialStateData();

                    return excludeEditDraftId ? rest : { editDraftId, ...rest };
                },
                false,
                'Resetting Editor State'
            );
        },
    };
};

export const createEditorStore = <T,>(key: string) => {
    return create<EditorStoreState<T>>()(
        devtools((set) => getInitialState<T>(set), devtoolsOptions(key))
    );
};

const storeName = (
    entityType: ENTITY,
    localScope?: boolean
): EditorStoreNames => {
    if (localScope) {
        return EditorStoreNames.GENERAL;
    } else if (entityType === ENTITY.CAPTURE) {
        return EditorStoreNames.CAPTURE;
    } else if (entityType === ENTITY.MATERIALIZATION) {
        return EditorStoreNames.MATERIALIZATION;
    } else {
        throw new Error('Invalid Editor store name');
    }
};

// Selector Hooks
interface SelectorParams {
    localScope?: boolean;
}

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

export const useEditorStore_editDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['editDraftId']
    >(storeName(entityType, localScope), (state) => state.editDraftId);
};

export const useEditorStore_setEditDraftId = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setEditDraftId']
    >(storeName(entityType, localScope), (state) => state.setEditDraftId);
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
    T = DraftSpecQuery | LiveSpecsQuery_spec
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

export const useEditorStore_status = (params?: SelectorParams | undefined) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['status']
    >(storeName(entityType, localScope), (state) => state.status);
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
