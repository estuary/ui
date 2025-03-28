import type { ConnectorWithTagDetailQuery } from 'src/hooks/connectors/shared';
import type { EntityWithCreateWorkflow } from 'src/types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
