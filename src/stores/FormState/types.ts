import { AlertColor } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { MessagePrefixes } from 'types';

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
    TESTED = 'TESTED',

    SCHEMA_EVOLVING = 'SCHEMA_EVOLVING',
    SCHEMA_EVOLVING_FAILED = 'SCHEMA_EVOLVING_FAILED',
    SCHEMA_EVOLVED = 'SCHEMA_EVOLVED',

    GENERATING = 'GENERATING_PREVIEW',
    GENERATED = 'GENERATED_PREVIEW',

    FAILED = 'FAILED',
}

export interface EntityFormState {
    // Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;

    // Form Status
    isIdle: boolean;
    isActive: boolean;

    updateStatus: (status: FormStatus) => void;

    // Misc.
    resetState: () => void;
    messagePrefix: MessagePrefixes;
}
