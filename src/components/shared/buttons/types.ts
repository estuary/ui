import {
    ButtonProps,
    PopperProps,
    SxProps,
    Theme,
    ToggleButtonProps,
} from '@mui/material';
import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export type BooleanString = 'true' | 'false';

export interface OutlinedToggleButtonProps extends ToggleButtonProps {
    defaultStateSx?: SxProps<Theme>;
    disabledStateSx?: SxProps<Theme>;
    selectedStateSx?: SxProps<Theme>;
}

export interface ButtonWithPopperProps extends BaseComponentProps {
    buttonProps: Partial<ButtonProps>;
    popper: ReactNode;
    popperProps?: Partial<PopperProps>;
}
