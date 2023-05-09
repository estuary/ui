import { AlertColor } from '@mui/material';
import { DraftSpec } from 'hooks/useDraftSpecs';

export enum EditorStatus {
    IDLE = 'nothing happened since load',
    EDITING = 'user typing',
    INVALID = 'editor value not parsable',
    SAVING = 'calling server to save changes',
    SAVED = 'changes saved to server',
    SAVE_FAILED = 'calling server failed',
    OUT_OF_SYNC = 'there are changes on server that client needs to merge',
}

export interface EditorStoreState<T> {
    id: string | null;
    setId: (newVal: EditorStoreState<T>['id']) => void;

    persistedDraftId: string | null;
    setPersistedDraftId: (
        newVal: EditorStoreState<T>['persistedDraftId']
    ) => void;

    discoveredDraftId: string | null;
    setDiscoveredDraftId: (
        newVal: EditorStoreState<T>['discoveredDraftId']
    ) => void;

    pubId: string | null;
    setPubId: (newVal: EditorStoreState<T>['pubId']) => void;

    // TODO: Resolve conflicting type. Determine whether current catalog can be a DraftSpecQuery, LiveSpecsQuery_spec, or null.
    //   See the FileSelector component for reference.
    currentCatalog: DraftSpec;
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

    // Draft Initialization
    draftInitializationError: null | {
        severity: AlertColor;
        messageId: string;
    };
    setDraftInitializationError: (
        value: EditorStoreState<T>['draftInitializationError']
    ) => void;

    resetState: (excludeEditDraftId?: boolean) => void;
}

// Selector Hooks
export interface SelectorParams {
    localScope?: boolean;
}
