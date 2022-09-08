import { FormStateStoreNames } from 'context/Zustand';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { EntityWithCreateWorkflow, Grants } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    accessGrants: Grants[];
    formStateStoreName: FormStateStoreNames;
    entityType: EntityWithCreateWorkflow;
    readOnly?: boolean;
}
