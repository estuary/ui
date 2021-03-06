import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import produce from 'immer';
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
