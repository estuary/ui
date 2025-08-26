import type { EntityWithCreateWorkflow } from 'src/types';

export interface Props {
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
