import { useEntityType } from 'components/shared/Entity/EntityContext';
import { useLocalZustandStore } from 'context/LocalZustand';
import {
    EditorStoreNames,
    useZustandStore as useGlobalZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import produce from 'immer';
import { ENTITY } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export const DraftSpecEditorKey = 'draftSpecEditor';

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

    editDraftId: string | null;
    setEditDraftId: (newVal: EditorStoreState<T>['editDraftId']) => void;

    pubId: string | null;
    setPubId: (newVal: EditorStoreState<T>['pubId']) => void;

    currentCatalog: DraftSpecQuery | null;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    // TODO (typing) : This needs typed. Using the T here made the checks in setSpecs break
    specs: any[] | null;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;

    serverUpdate: any | null;
    setServerUpdate: (newVal: EditorStoreState<T>['serverUpdate']) => void;

    isSaving: boolean;
    isEditing: boolean;
    status: EditorStatus;
    setStatus: (newVal: EditorStatus) => void;

    resetState: () => void;
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

        resetState: () => {
            set(getInitialStateData(), false, 'Resetting Editor State');
        },
    };
};

export const createEditorStore = <T,>(key: string) => {
    return create<EditorStoreState<T>>()(
        devtools((set) => getInitialState<T>(set), devtoolsOptions(key))
    );
};

// Selector Hooks
interface SelectorParams {
    localScope?: boolean;
}

const storeName = (
    entityType: ENTITY,
    localScope?: boolean
): EditorStoreNames => {
    if (localScope) {
        return EditorStoreNames.LOCAL;
    } else if (entityType === ENTITY.CAPTURE) {
        return EditorStoreNames.CAPTURE;
    } else if (entityType === ENTITY.MATERIALIZATION) {
        return EditorStoreNames.MATERIALIZATION;
    } else {
        throw new Error('Invalid Editor store name');
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

export const useEditorStore_specs = (params?: SelectorParams | undefined) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['specs']
    >(storeName(entityType, localScope), (state) => state.specs);
};

export const useEditorStore_setSpecs = (
    params?: SelectorParams | undefined
) => {
    const localScope = params?.localScope;

    const useZustandStore = localScope
        ? useLocalZustandStore
        : useGlobalZustandStore;

    const entityType = useEntityType();

    return useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setSpecs']
    >(storeName(entityType, localScope), (state) => state.setSpecs);
};
