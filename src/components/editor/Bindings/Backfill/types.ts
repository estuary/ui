import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';

export interface BackfillButtonProps {
    description: ReactNode;
    bindingIndex?: number;
}

export interface BackfillCountProps {
    disabled?: boolean;
}

export interface BackfillModeSelectorProps {
    disabled?: boolean;
}

export interface BackfillProps {
    bindingIndex: number;
    collectionEnabled: boolean;
    collection?: string;
}

export interface SectionWrapperProps extends BaseComponentProps {
    alertMessageId: string;
    collection?: string;
}
