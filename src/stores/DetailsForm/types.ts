import { JsonFormsCore } from '@jsonforms/core';
import { StoreWithHydration } from 'stores/Hydration';
import { EntityWithCreateWorkflow, EntityWorkflow } from 'types';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage: {
            id: string;
            iconPath: string;
            imagePath: string;
            connectorId: string;
        };
    };
}

export interface DetailsFormState extends StoreWithHydration {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;
    setDetails_connector: (
        connector: Details['data']['connectorImage']
    ) => void;

    detailsFormErrorsExist: boolean;

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
