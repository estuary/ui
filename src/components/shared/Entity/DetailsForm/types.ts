import { EntityWithCreateWorkflow } from 'types';

import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
