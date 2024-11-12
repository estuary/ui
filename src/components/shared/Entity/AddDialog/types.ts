import { ReactNode } from 'react';
import { AddCollectionDialogCTAProps } from '../types';

export interface AddDialogProps extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    primaryCTA: any;
    selectedCollections: string[];
    title: string | ReactNode;
    optionalSettings?: ReactNode;
}
