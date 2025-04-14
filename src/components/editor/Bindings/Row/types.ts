import type { BaseComponentProps } from 'src/types';

export interface ErrorIndicatorProps {
    bindingUUID: string;
    collection: string;
}

export interface SelectorNameProps {
    bindingUUID: string;
    collection: string[];
    filterValue?: string;
}

export interface NameHighlightProps extends BaseComponentProps {
    highlightIndex: number;
}

export interface BindingsSelectorToggleProps {
    bindingUUID: string;
}
