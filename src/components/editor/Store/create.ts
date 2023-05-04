import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EditorStatus, EditorStoreState } from './types';

export const isEditorActive = (status: EditorStatus) => {
    return status === EditorStatus.SAVING;
};

const getInitialStateData = () => {
    return {
        currentCatalog: null,
        id: null,
        discoveredDraftId: null,
        persistedDraftId: null,
        pubId: null,
        specs: null,
        isSaving: false,
        isEditing: false,
        status: EditorStatus.IDLE,
        serverUpdate: null,
        draftInitializationError: null,
    };
};

const getInitialState = <T>(
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

        setDraftInitializationError: (value) => {
            set(
                produce((state) => {
                    state.draftInitializationError = value;
                }),
                false,
                'Draft Initialization Error Set'
            );
        },

        // This is a hacky, temporary solution to preserve the persisted draft ID
        // when the generate button is clicked in all workflows.
        resetState: (excludePersistedDraftId) => {
            set(
                () => {
                    const { persistedDraftId, ...rest } = getInitialStateData();

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
        devtools((set) => getInitialState<T>(set), devtoolsOptions(key))
    );
};
