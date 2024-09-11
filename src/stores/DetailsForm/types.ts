import { JsonFormsCore } from '@jsonforms/core';
import { StoreWithCustomErrors } from 'stores/extensions/CustomErrors';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { EntityWorkflow } from 'types';

export interface DataPlaneOption {
    dataPlaneName: string;
    id: string;
    scope: 'public' | 'private';
}

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        connectorImage: {
            id: string;
            iconPath: string;
            imageName: string;
            imagePath: string;
            connectorId: string;
        };
        entityName: string;
        dataPlane?: DataPlaneOption;
        description?: string;
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
    setDetails_dataPlane: (value: Details['data']['dataPlane']) => void;

    errorsExist: boolean;

    // Connectors
    connectors: { [key: string]: any }[];
    setConnectors: (val: DetailsFormState['connectors']) => void;

    unsupportedConnectorVersion: boolean;
    setUnsupportedConnectorVersion: (
        evaluatedId: string,
        existingId: string
    ) => void;

    // Misc.
    draftedEntityName: string;
    setDraftedEntityName: (
        value: DetailsFormState['draftedEntityName']
    ) => void;

    entityNameChanged: boolean;
    setEntityNameChanged: (value: string) => void;

    previousDetails: Details;
    setPreviousDetails: (value: DetailsFormState['previousDetails']) => void;

    hydrateState: (workflow: EntityWorkflow | null) => Promise<void>;

    stateChanged: () => boolean;
    resetState: () => void;
}
