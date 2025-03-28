import type { ReactNode } from 'react';

import type { AlertColor } from '@mui/material';

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
