import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { ReactNode } from 'react';
import { AddCollectionDialogCTAProps } from '../types';

export interface AddDialogProps extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    PrimaryCTA: (props: AddCollectionDialogCTAProps) => EmotionJSX.Element;
    selectedCollections: string[];
    title: string | ReactNode;
    optionalSettings?: ReactNode;
    SecondaryCTA?: (props: AddCollectionDialogCTAProps) => EmotionJSX.Element;
}
