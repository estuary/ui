import { ReactNode } from 'react';

import { DraftSpecQuery } from 'src/hooks/useDraftSpecs';

export interface CollectionConfigProps {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    hideBorder?: boolean;
    RediscoverButton?: ReactNode;
}
