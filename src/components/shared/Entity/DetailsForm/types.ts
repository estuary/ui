import { ConnectorWithTagDetailQuery } from 'src/hooks/connectors/shared';
import { EntityWithCreateWorkflow } from 'src/types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
