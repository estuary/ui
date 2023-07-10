import produce from 'immer';
import { omit } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EditorStatus, EditorStoreState } from './types';

export const isEditorActive = (status: EditorStatus) => {
    return status === EditorStatus.SAVING;
};

const getInitialStateData = <T>(): Pick<
    EditorStoreState<T>,
    | 'currentCatalog'
    | 'discoveredDraftId'
    | 'draftInitializationError'
    | 'id'
    | 'invalidEditors'
    | 'isEditing'
    | 'isSaving'
    | 'persistedDraftId'
    | 'pubId'
    | 'queryResponse'
    | 'serverUpdate'
    | 'specs'
    | 'statuses'
> => {
    return {
        currentCatalog: null,
        id: null,
        discoveredDraftId: null,
        persistedDraftId: null,
        pubId: null,
        specs: null,
        statuses: {},
        isSaving: false,
        isEditing: false,
        serverUpdate: null,
        draftInitializationError: null,
        queryResponse: { draftSpecs: [], isValidating: false, mutate: null },
        invalidEditors: [],
    };
};

const getInitialState = <T>(
    set: NamedSet<EditorStoreState<T>>,
    get: StoreApi<EditorStoreState<T>>['getState']
): EditorStoreState<T> => {
    return {
        ...getInitialStateData<T>(),
        setId: (newVal) => {
            set(
                produce((state) => {
                    state.id = newVal;
                }),
                false,
                'Set draft id'
            );
        },

        setPersistedDraftId: (newVal) => {
            set(
                produce((state) => {
                    state.persistedDraftId = newVal;
                }),
                false,
                'Set persisted draft id'
            );
        },

        setDiscoveredDraftId: (newVal) => {
            set(
                produce((state) => {
                    state.discoveredDraftId = newVal;
                }),
                false,
                'Set discovered draft id'
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

        setStatus: (value, path) => {
            set(
                produce((state) => {
                    if (Object.hasOwn(state.statuses, path)) {
                        state.statuses[path] = value;
                    } else {
                        state.statuses = { ...state.statuses, [path]: value };
                    }

                    const editorStatuses: EditorStatus[] = Object.values(
                        state.statuses
                    );

                    state.isSaving = editorStatuses.some(
                        (status) => status === EditorStatus.SAVING
                    );
                    state.isEditing = editorStatuses.some(
                        (status) => status === EditorStatus.EDITING
                    );

                    state.invalidEditors = Object.entries(state.statuses)
                        .filter(
                            ([_key, status]) =>
                                status === EditorStatus.INVALID ||
                                status === EditorStatus.SAVE_FAILED ||
                                status === EditorStatus.OUT_OF_SYNC
                        )
                        .map(([key, _status]) => key);
                }),
                false,
                'Setting status'
            );
        },

        removeStaleStatus: (value) => {
            set(
                produce((state) => {
                    const { invalidEditors, statuses } = get();

                    if (Object.hasOwn(statuses, value)) {
                        state.statuses = omit(statuses, value);
                    }

                    state.invalidEditors = invalidEditors.filter(
                        (path) => path !== value
                    );
                }),
                false,
                'Stale Status Removed'
            );
        },

        setDraftInitializationError: (value) => {
            set(
                produce((state) => {
                    state.draftInitializationError = value;
                }),
                false,
                'Draft Initialization Error Set'
            );
        },

        setQueryResponse: (value) => {
            set(
                produce((state) => {
                    state.queryResponse = value;
                }),
                false,
                'Query Response Set'
            );
        },

        // This is a hacky, temporary solution to preserve the persisted draft ID
        // when the generate button is clicked in all workflows.
        resetState: (excludePersistedDraftId) => {
            set(
                () => {
                    const { persistedDraftId, ...rest } =
                        getInitialStateData<T>();

                    return excludePersistedDraftId
                        ? rest
                        : { persistedDraftId, ...rest };
                },
                false,
                'Resetting Editor State'
            );
        },
    };
};

export const createEditorStore = <T>(key: string) => {
    return create<EditorStoreState<T>>()(
        devtools(
            (set, get) => getInitialState<T>(set, get),
            devtoolsOptions(key)
        )
    );
};
