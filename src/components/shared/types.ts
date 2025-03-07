import { AlertColor, SxProps } from '@mui/material';

import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export interface AlertBoxProps extends BaseComponentProps {
    severity: AlertColor;
    short: boolean; // Forcing this on... but do not want to change all calls right now
    sx?: SxProps;
    headerMessage?: string | ReactNode;
    hideIcon?: boolean;
    onClose?: () => void;
    title?: string | ReactNode;
}
