import type { ReactNode } from 'react';
import type { DraftSpecSwrMetadata } from 'src/hooks/useDraftSpecs';
import type { EntityWithCreateWorkflow } from 'src/types';

export interface BaseEntityCreateProps {
    entityType: EntityWithCreateWorkflow;
    Toolbar: ReactNode;
}

export interface EntityCreateConfigProps {
    entityType: EntityWithCreateWorkflow;
    condensed?: boolean;
}

export interface EntityCreateProps extends BaseEntityCreateProps {
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    RediscoverButton?: ReactNode;
}
