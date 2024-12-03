import { ReactNode } from 'react';

export interface BackfillProps {
    description: ReactNode;
    bindingIndex?: number;
}

export interface BackfillDataflowOptionProps {
    disabled?: boolean;
}

export interface BackfillCountProps {
    disabled?: boolean;
}
