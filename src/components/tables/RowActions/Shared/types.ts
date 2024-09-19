import { ReactNode } from 'react';

export const ProgressFinished = 200;

// Making these high numbers so we have room to put extras between
export enum ProgressStates {
    IDLE = -100, // new for steps
    PAUSED = 0, // Not used right now
    RUNNING = 100,

    // Here and above is considered finished
    SKIPPED = 200,
    SUCCESS = 300,
    FAILED = 400,
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
