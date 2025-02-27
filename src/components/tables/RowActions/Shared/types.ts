import { ReactNode } from 'react';

export const ProgressFinished = 60;

// These go up by 20s so there is room to inject more states if needed
export enum ProgressStates {
    IDLE = -20, // Currently only used by Prompt Steps
    PAUSED = 0, // Unused
    RUNNING = 20,
    RETRYING = 40, // Unused

    // Make sure this stays in sync with ProgressFinished
    SKIPPED = 60,
    SUCCESS = 80,
    FAILED = 100,
}

export interface SharedProgressProps {
    name: string;
    error: any | null;
    logToken?: string | null;
    renderError?: (error: any, progressState: ProgressStates) => ReactNode;
    renderLogs?: Function | boolean;
    skippedMessageID?: string;
    runningMessageID: string;
    successMessageID: string;
    state: ProgressStates;
}

export interface ConfirmationAlertProps {
    messageId: string;
    potentiallyDangerousUpdate?: boolean;
}
