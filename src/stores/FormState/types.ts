import { AlertColor } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { MessagePrefixes } from 'types';

export interface FormState {
    displayValidation: boolean;
    error: {
        title: string;
        error?: PostgrestError;
    } | null;
    exitWhenLogsClose: boolean;
    logToken: string | null;
    message: {
        key: string | null;
        severity: AlertColor | null;
    };
    showLogs: boolean;
    status: FormStatus;
}

export enum FormStatus {
    FAILED = 'FAILED',

    GENERATED = 'GENERATED_PREVIEW',
    GENERATING = 'GENERATING_PREVIEW',

    INIT = 'IDLE',
    SAVED = 'SAVED',

    SAVING = 'SAVING',
    TESTED = 'TESTED',

    TESTING = 'TESTING',
}

export interface EntityFormState {
    // Form State
    formState: FormState;
    isActive: boolean;

    // Form Status
    isIdle: boolean;
    messagePrefix: MessagePrefixes;

    // Misc.
    resetState: () => void;

    setFormState: (data: Partial<FormState>) => void;
    updateStatus: (status: FormStatus) => void;
}
