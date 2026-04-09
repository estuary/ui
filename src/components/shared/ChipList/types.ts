import type { SxProps, Theme } from '@mui/material';
import type { CustomChipProps } from 'src/styledComponents/chips/OutlinedChip';

export interface ChipDisplay extends CustomChipProps {
    display: string;
    link?: string;
    newWindow?: boolean;
    title?: string;
}

export interface ChipWrapperProps {
    onClick?: () => void;
    disabled?: boolean;
    forceTooltip?: boolean;
    stripPath?: boolean;
    title?: string;
    val: ChipDisplay;
}

export interface ChipListProps {
    values: string[] | ChipDisplay[];
    disabled?: boolean;
    maxChips?: number;
    newWindow?: boolean;
    stripPath?: boolean;
    forceTooltip?: boolean;
    sx?: SxProps<Theme>;
}
