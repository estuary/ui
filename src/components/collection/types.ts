import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { ReactNode } from 'react';

export interface CollectionConfigProps {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    hideBorder?: boolean;
    RediscoverButton?: ReactNode;
}
