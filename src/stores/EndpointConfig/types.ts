import { StoreWithHydration } from 'stores/Hydration';
import {
    EntityWithCreateWorkflow,
    EntityWorkflow,
    JsonFormsData,
    Schema,
} from 'types';

export interface EndpointConfigState extends StoreWithHydration {
    endpointSchema: Schema;
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;

    // Used to display custom errors in JsonForms
    endpointCustomErrors: any[];
    setEndpointCustomErrors: (
        val: EndpointConfigState['endpointCustomErrors']
    ) => void;

    // Encrypted Endpoint Configs
    publishedEndpointConfig: JsonFormsData;
    setPublishedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['publishedEndpointConfig']
    ) => void;

    encryptedEndpointConfig: JsonFormsData;
    setEncryptedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['encryptedEndpointConfig']
    ) => void;

    // JSON Form Compatible-Endpoint Configs
    previousEndpointConfig: JsonFormsData;
    setPreviousEndpointConfig: (
        endpointConfig: EndpointConfigState['previousEndpointConfig']
    ) => void;

    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: { message: string | undefined }[];

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    // Hydration
    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        workflow: EntityWorkflow | null
    ) => Promise<void>;

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}
