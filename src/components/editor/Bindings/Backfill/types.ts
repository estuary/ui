import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

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

export interface BackfillSectionProps extends BaseComponentProps {
    isBinding?: boolean;
}
