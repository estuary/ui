import { JsonFormsCore } from '@jsonforms/core';
import { StoreWithHydration } from 'stores/Hydration';
import { EntityWithCreateWorkflow, EntityWorkflow } from 'types';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        connectorImage: {
            connectorId: string;
            iconPath: string;
            id: string;
            imageName: string;
            imagePath: string;
        };
        entityName: string;
        description?: string;
    };
}

export interface DetailsFormState extends StoreWithHydration {
    // Connectors
    connectors: { [key: string]: any }[];
    // Form Data
    details: Details;
    detailsFormErrorsExist: boolean;

    // Misc.
    draftedEntityName: string;

    entityNameChanged: boolean;
    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        workflow: EntityWorkflow | null
    ) => Promise<void>;

    previousDetails: Details;
    resetState: () => void;

    setConnectors: (val: DetailsFormState['connectors']) => void;
    setDetails: (details: Details) => void;

    setDetails_connector: (
        connector: Details['data']['connectorImage']
    ) => void;
    setDraftedEntityName: (
        value: DetailsFormState['draftedEntityName']
    ) => void;

    setEntityNameChanged: (value: string) => void;

    setPreviousDetails: (value: DetailsFormState['previousDetails']) => void;
    stateChanged: () => boolean;
}
