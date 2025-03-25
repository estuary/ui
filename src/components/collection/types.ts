import type { DraftSpecQuery } from 'hooks/useDraftSpecs';
import type { ReactNode } from 'react';

export interface CollectionConfigProps {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    hideBorder?: boolean;
    RediscoverButton?: ReactNode;
}
