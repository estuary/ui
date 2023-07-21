import { EntityWithCreateWorkflow, EntityWorkflow } from 'types';

import { JsonFormsCore } from '@jsonforms/core';

import { StoreWithCustomErrors } from 'stores/extensions/CustomErrors';
import { StoreWithHydration } from 'stores/extensions/Hydration';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage: {
            id: string;
            iconPath: string;
            imageName: string;
            imagePath: string;
            connectorId: string;
        };
    };
}

export interface DetailsFormState
    extends StoreWithHydration,
        StoreWithCustomErrors {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;
    setDetails_connector: (
        connector: Details['data']['connectorImage']
    ) => void;

    errorsExist: boolean;

    // Connectors
    connectors: { [key: string]: any }[];
    setConnectors: (val: DetailsFormState['connectors']) => void;

    // Misc.
    draftedEntityName: string;
    setDraftedEntityName: (
        value: DetailsFormState['draftedEntityName']
    ) => void;

    entityNameChanged: boolean;
    setEntityNameChanged: (value: string) => void;

    previousDetails: Details;
    setPreviousDetails: (value: DetailsFormState['previousDetails']) => void;

    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        workflow: EntityWorkflow | null
    ) => Promise<void>;

    stateChanged: () => boolean;
    resetState: () => void;
}
