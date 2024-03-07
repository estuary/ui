import { ConnectorWithTagDetailQuery } from 'hooks/connectors/useConnectorWithTagDetail';
import { EntityWithCreateWorkflow } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
