import { ReactNode } from 'react';

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
}
