import type { AlertColor } from '@mui/material';
import type { PostgrestError } from '@supabase/postgrest-js';
import type { MessagePrefixes, Schema } from 'src/types';

export interface FormState {
    displayValidation: boolean;
    status: FormStatus;
    showLogs: boolean;
    exitWhenLogsClose: boolean;
    logToken: string | null;
    error: {
        title: string;
        error?: PostgrestError;
    } | null;
    message: {
        key: string | null;
        severity: AlertColor | null;
    };
}

export enum FormStatus {
    INIT = 'IDLE',

    SAVING = 'SAVING',
    SAVED = 'SAVED',

    TESTING = 'TESTING',
    TESTING_BACKGROUND = 'TESTING_BACKGROUND',
    TESTED = 'TESTED',

    SCHEMA_EVOLVING = 'SCHEMA_EVOLVING',
    SCHEMA_EVOLVING_FAILED = 'SCHEMA_EVOLVING_FAILED',
    SCHEMA_EVOLVED = 'SCHEMA_EVOLVED',

    GENERATING = 'GENERATING_PREVIEW',
    GENERATED = 'GENERATED_PREVIEW',

    UPDATING = 'UPDATING',
    UPDATED = 'UPDATED',

    FAILED = 'FAILED',

    // USE WITH CAUTION - only for prompts right now (Q3 2024)
    LOCKED = 'LOCKED',
    PROCESSING = 'PROCESSING',
}

export interface EntityFormState {
    // Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;

    // Form Status
    isIdle: boolean;
    isActive: boolean;

    liveSpec: Schema | null;
    setLiveSpec: (data: EntityFormState['liveSpec']) => void;

    updateStatus: (status: FormStatus, background?: boolean) => void;

    // Misc.
    resetState: () => void;
    messagePrefix: MessagePrefixes;
}
