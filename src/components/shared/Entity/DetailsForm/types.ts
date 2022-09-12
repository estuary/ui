import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { EntityWithCreateWorkflow, Grants } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    accessGrants: Grants[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
