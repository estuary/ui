import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode } from 'react';
import { EntityWithCreateWorkflow } from 'types';

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
