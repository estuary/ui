import type { ReactElement, ReactNode } from 'react';
import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

export interface AddDialogProps extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    PrimaryCTA: (props: AddCollectionDialogCTAProps) => ReactElement | null;
    selectedCollections: string[];
    title: string | ReactNode;
    OptionalSettings?: () => ReactElement | null;
    SecondaryCTA?: (props: AddCollectionDialogCTAProps) => ReactElement | null;
}
