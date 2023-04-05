import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { EntityWithCreateWorkflow } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
