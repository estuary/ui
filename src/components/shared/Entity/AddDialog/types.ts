import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import type { ReactNode } from 'react';
import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

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
