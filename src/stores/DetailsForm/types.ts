import { JsonFormsCore } from '@jsonforms/core';
import { StoreWithCustomErrors } from 'stores/extensions/CustomErrors';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { EntityWorkflow } from 'types';

export interface DataPlaneName {
    cluster: string;
    prefix: string;
    provider: string;
    region: string;
    whole: string;
}

export interface DataPlaneOption {
    dataPlaneName: DataPlaneName;
    id: string;
    reactorAddress: string;
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

    dataPlaneOptions: DataPlaneOption[];
    setDataPlaneOptions: (value: DetailsFormState['dataPlaneOptions']) => void;

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

    resetState: () => void;
}
