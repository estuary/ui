import type { ReactNode } from 'react';
import type { AddDialogProps } from 'src/components/shared/Entity/AddDialog/types';

export interface CollectionSelectorProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

export interface BindingsEditorAddProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    disabled?: boolean;
}
