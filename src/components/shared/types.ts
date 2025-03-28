import { AlertColor, SxProps } from '@mui/material';

import { ReactNode } from 'react';
import { BaseComponentProps } from 'src/types';

// TODO (AlertBox) we defaulted short to false at the start. That was a mistake
//  so we need to get `short` to default to `true` soon.
export interface AlertBoxProps extends BaseComponentProps {
    severity: AlertColor;
    short: boolean; // Forcing this on... but do not want to change all calls right now
    sx?: SxProps;
    headerMessage?: string | ReactNode;
    hideIcon?: boolean;
    onClose?: () => void;
    title?: string | ReactNode;
}

export interface RadioMenuItemProps {
    description: string;
    label: string;
    value: string;
}
