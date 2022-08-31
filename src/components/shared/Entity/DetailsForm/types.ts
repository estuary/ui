import { DraftEditorStoreNames, FormStateStoreNames } from 'context/Zustand';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { ENTITY_WITH_CREATE, Grants } from 'types';

export interface Props {
    connectorTags: ConnectorWithTagDetailQuery[];
    accessGrants: Grants[];
    draftEditorStoreName: DraftEditorStoreNames;
    formStateStoreName: FormStateStoreNames;
    entityType: ENTITY_WITH_CREATE;
}
