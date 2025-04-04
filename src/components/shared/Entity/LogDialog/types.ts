import type { AlertColor } from '@mui/material';
import type { ReactNode } from 'react';

export interface LogDialogProps {
    open: boolean;
    token: string | null;
    title: ReactNode;
    actionComponent: ReactNode;
}

export interface LogDialogContentProps {
    spinnerMessageId: string | null;
    severity: AlertColor | null;
    token: string | null;
}
