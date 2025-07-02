import type { JsonFormsCore } from '@jsonforms/core';
import type { StoreWithCustomErrors } from 'src/stores/extensions/CustomErrors';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { EntityWorkflow } from 'src/types';

export interface DataPlaneName {
    cluster: string;
    prefix: string;
    provider: string;
    region: string;
    whole: string;
}

export type DataPlaneScopes = 'public' | 'private';

export interface DataPlaneOption {
    dataPlaneName: DataPlaneName;
    id: string;
    isDefault: boolean;
    reactorAddress: string;
    scope: DataPlaneScopes;
    cidrBlocks?: string[] | null;
}

export interface ConnectorMetadata {
    connectorId: string;
    iconPath: string;
    id: string;
    imageName: string;
    imageTag: string;
}

export interface StandardConnectorMetadata extends ConnectorMetadata {
    imagePath: string;
}

export interface DekafConnectorMetadata extends ConnectorMetadata {
    variant: string;
}

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        connectorImage: StandardConnectorMetadata | DekafConnectorMetadata;
        entityName: string;
        dataPlane?: DataPlaneOption;
    };
}

// TODO (search params) - need to stop getting search params from within zustand
//  should pass in with optiosn like this one
// export interface DetailsHydrateOptions {
//     connectorId: string | null;
//     dataPlaneId: string | null;
//     liveSpecId: string | null;
// }

export interface DetailsFormState
    extends StoreWithHydration,
        StoreWithCustomErrors {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;
    setDetails_connector: (
        connector: Details['data']['connectorImage']
    ) => void;
    setDetails_dataPlane: (value: Details['data']['dataPlane'] | null) => void;

    dataPlaneOptions: DataPlaneOption[];
    setDataPlaneOptions: (value: DetailsFormState['dataPlaneOptions']) => void;
    existingDataPlaneOption: DataPlaneOption | undefined;
    setExistingDataPlaneOption: (value: DataPlaneOption | undefined) => void;

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

    hydrateState: (
        workflow: EntityWorkflow | null,
        dataPlaneOptions: DataPlaneOption[]
    ) => Promise<void>;

    resetState: () => void;
}
