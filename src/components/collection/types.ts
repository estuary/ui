import type { ReactNode } from 'react';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';

export interface CollectionConfigProps {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    hideBorder?: boolean;
    RediscoverButton?: ReactNode;
}
