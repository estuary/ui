import { ReactNode } from 'react';

export enum ProgressStates {
    IDLE = -1, // new for steps
    PAUSED = 0, // Not used
    RUNNING = 1,
    SKIPPED = 2,
    FAILED = 3,
    SUCCESS = 4,
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
