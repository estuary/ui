import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export interface BackfillButtonProps {
    description: ReactNode;
    bindingIndex?: number;
}

export interface BackfillCountProps {
    disabled?: boolean;
}

export interface BackfillDataflowOptionProps {
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
