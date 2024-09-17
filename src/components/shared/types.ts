import { AlertColor } from '@mui/material';

import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export interface AlertBoxProps extends BaseComponentProps {
    severity: AlertColor;
    fitWidth?: boolean;
    hideIcon?: boolean;
    onClose?: () => void;
    short?: boolean;
    title?: string | ReactNode;
}
