import type {
    ButtonProps,
    PopperProps,
    SxProps,
    Theme,
    ToggleButtonProps,
} from '@mui/material';
import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';

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
    trigger?: 'click' | 'hover';
}

export interface CopyToClipboardButtonProps extends BaseComponentProps {
    writeValue: string;
}
