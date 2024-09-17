import { ReactNode } from 'react';

export const ProgressFinished = 200;

export enum ProgressStates {
    IDLE = -1, // new for steps
    PAUSED = 0, // Not used
    RUNNING = 1,
    SKIPPED = 2,

    // Making these high numbers so we have room to put extras between
    SUCCESS = 200,
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
