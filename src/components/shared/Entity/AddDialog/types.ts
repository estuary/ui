import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { ReactNode } from 'react';
import { AddCollectionDialogCTAProps } from '../types';

export interface AddDialogProps extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    PrimaryCTA: (
        props: AddCollectionDialogCTAProps
    ) => EmotionJSX.Element | null;
    selectedCollections: string[];
    title: string | ReactNode;
    OptionalSettings?: () => EmotionJSX.Element | null;
    SecondaryCTA?: (
        props: AddCollectionDialogCTAProps
    ) => EmotionJSX.Element | null;
}
