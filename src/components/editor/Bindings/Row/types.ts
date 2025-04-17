import type { ButtonProps } from '@mui/material';
import type { BaseComponentProps } from 'src/types';

export interface ErrorIndicatorProps {
    bindingUUID: string;
    collection: string;
}

export interface SelectorNameProps {
    collection: string[];
    filterValue?: string;
    buttonProps?: Partial<ButtonProps>;
}

export interface NameHighlightProps extends BaseComponentProps {
    highlightIndex: number;
}

export interface BindingsSelectorToggleProps {
    bindingUUID: string;
}
