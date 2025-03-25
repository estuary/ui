import type { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import type { EntityWithCreateWorkflow } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
