import { AlertColor } from '@mui/material';

export interface SpinnerMessageKeys {
    runningKey: string;
    stoppedKey: string;
}

export interface SpinnerOptions {
    disable?: boolean;
    messages?: SpinnerMessageKeys;
    severity?: AlertColor | null;
}
