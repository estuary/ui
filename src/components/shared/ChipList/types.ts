import { SxProps, Theme } from '@mui/material';

export interface ChipDisplay {
    display: string;
    link?: string;
    title?: string;
}

export interface ChipWrapperProps {
    onClick?: () => void;
    disabled?: boolean;
    stripPath?: boolean;
    title?: string;
    val: ChipDisplay;
}

export interface ChipListProps {
    values: string[] | ChipDisplay[];
    disabled?: boolean;
    maxChips?: number;
    stripPath?: boolean;
    sx?: SxProps<Theme>;
}
