import { SxProps, Theme, ToggleButtonProps } from '@mui/material';

export type BooleanString = 'true' | 'false';

export interface OutlinedToggleButtonProps extends ToggleButtonProps {
    defaultStateSx?: SxProps<Theme>;
    disabledStateSx?: SxProps<Theme>;
    selectedStateSx?: SxProps<Theme>;
}
