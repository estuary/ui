import type { AlertColor } from '@mui/material';
import type { PostgrestError, PostgrestResponse } from '@supabase/postgrest-js';
import type { DraftSpec, DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { BaseComponentProps } from 'src/types';
import type { KeyedMutator } from 'swr';

export interface DraftSpecResponse {
    draftSpecs: DraftSpecQuery[];
    isValidating: boolean;
    mutate: KeyedMutator<PostgrestResponse<DraftSpecQuery>> | null;
    error?: PostgrestError;
}

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

    catalogName: string;
    setCatalogName: (newVal: EditorStoreState<T>['catalogName']) => void;

    // TODO: Resolve conflicting type. Determine whether current catalog can be a DraftSpecQuery, LiveSpecsQuery_details, or null.
    //   See the FileSelector component for reference.
    currentCatalog: DraftSpec;
    setCurrentCatalog: (newVal: EditorStoreState<T>['currentCatalog']) => void;

    specs: T[] | null;
    setSpecs: (newVal: EditorStoreState<T>['specs']) => void;

    // TODO (editor store) Confirm that a server update will always be a DraftSpecQuery.
    serverUpdate: any | null;
    setServerUpdate: (newVal: EditorStoreState<T>['serverUpdate']) => void;

    isSaving: boolean;
    isEditing: boolean;
    statuses: { [path: string]: EditorStatus };
    setStatus: (status: EditorStatus, path: string) => void;
    removeStaleStatus: (path: string) => void;

    invalidEditors: string[];

    // Draft Initialization
    draftInitializationError: null | {
        severity: AlertColor;
        messageId: string;
    };
    setDraftInitializationError: (
        value: EditorStoreState<T>['draftInitializationError']
    ) => void;

    // Misc.
    // TODO (editor store) need to include a boolean for storing off if hydration is done
    queryResponse: DraftSpecResponse;
    setQueryResponse: (value: EditorStoreState<T>['queryResponse']) => void;

    resetState: (excludeEditDraftId?: boolean) => void;
}

export interface LiveSpecsHydratorProps extends BaseComponentProps {
    localZustandScope: boolean;
    catalogName: string;
}
