import { AlertColor } from '@mui/material';

export interface SpinnerMessageKeys {
    runningKey: string;
    stoppedKey: string;
}

export interface SpinnerOptions {
    disable?: boolean;
    severity?: AlertColor | null;
    messages?: SpinnerMessageKeys;
}
