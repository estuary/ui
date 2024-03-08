import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { EntityWithCreateWorkflow } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
