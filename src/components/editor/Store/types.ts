import { AlertColor } from '@mui/material';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';

export enum EditorStatus {
    EDITING = 'user typing',
    IDLE = 'nothing happened since load',
    INVALID = 'editor value not parsable',
    OUT_OF_SYNC = 'there are changes on server that client needs to merge',
    SAVED = 'changes saved to server',
    SAVE_FAILED = 'calling server failed',
    SAVING = 'calling server to save changes',
}

export interface EditorStoreState<T> {
    // TODO: Resolve conflicting type. Determine whether current catalog can be a DraftSpecQuery, LiveSpecsQuery_spec, or null.
    //   See the FileSelector component for reference.
    currentCatalog: DraftSpecQuery | null;

    // Draft Initialization
    draftInitializationError: null | {
        messageId: string;
        severity: AlertColor;
    };

    id: string | null;
    isEditing: boolean;

    isSaving: boolean;
    persistedDraftId: string | null;

    pubId: string | null;
    resetState: (excludeEditDraftId?: boolean) => void;

    // TODO: Confirm that a server update will always be a DraftSpecQuery.
    serverUpdate: any | null;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    setDraftInitializationError: (
        value: EditorStoreState<T>['draftInitializationError']
    ) => void;
    setId: (newVal: EditorStoreState<T>['id']) => void;

    setPersistedDraftId: (
        newVal: EditorStoreState<T>['persistedDraftId']
    ) => void;
    setPubId: (newVal: EditorStoreState<T>['pubId']) => void;
    setServerUpdate: (newVal: EditorStoreState<T>['serverUpdate']) => void;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;

    setStatus: (newVal: EditorStatus) => void;
    specs: T[] | null;

    status: EditorStatus;
}

// Selector Hooks
export interface SelectorParams {
    localScope?: boolean;
}
