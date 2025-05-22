import type { ButtonProps } from '@mui/material';
import type { Chunk } from 'highlight-words-core';
import type { BaseComponentProps } from 'src/types';

export interface ErrorIndicatorProps {
    bindingUUID: string;
    collection: string;
}

export interface SelectorNameProps {
    collection: string[];
    highlightChunks: Chunk[];
    buttonProps?: Partial<ButtonProps>;
    filterValue?: string;
}

export interface NameHighlightProps extends BaseComponentProps {
    highlightIndex: number;
}

export interface BindingsSelectorToggleProps {
    bindingUUID: string;
}

export interface HighlighterProps {
    chunks: Chunk[];
    output: string;
}
