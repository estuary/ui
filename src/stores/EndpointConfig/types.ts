import { StoreWithHydration } from 'stores/Hydration';
import {
    EntityWithCreateWorkflow,
    EntityWorkflow,
    JsonFormsData,
    Schema,
} from 'types';

export interface EndpointConfigState extends StoreWithHydration {
    encryptedEndpointConfig: JsonFormsData;
    // Storing if the endpoint config is allowed to be empty
    endpointCanBeEmpty: boolean;

    endpointConfig: JsonFormsData;
    endpointConfigErrors: { message: string | undefined }[];

    endpointConfigErrorsExist: boolean;

    // Used to display custom errors in JsonForms
    endpointCustomErrors: any[];

    endpointSchema: Schema;

    // Hydration
    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        workflow: EntityWorkflow | null
    ) => Promise<void>;

    // JSON Form Compatible-Endpoint Configs
    previousEndpointConfig: JsonFormsData;

    // Encrypted Endpoint Configs
    publishedEndpointConfig: JsonFormsData;

    resetState: () => void;

    // Server-Form Alignment
    serverUpdateRequired: boolean;

    setEncryptedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['encryptedEndpointConfig']
    ) => void;
    setEndpointCanBeEmpty: (value: boolean) => void;

    setEndpointConfig: (endpointConfig: JsonFormsData) => void;
    setEndpointCustomErrors: (
        val: EndpointConfigState['endpointCustomErrors']
    ) => void;

    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;
    setPreviousEndpointConfig: (
        endpointConfig: EndpointConfigState['previousEndpointConfig']
    ) => void;

    setPublishedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['publishedEndpointConfig']
    ) => void;

    setServerUpdateRequired: (value: boolean) => void;

    // Misc.
    stateChanged: () => boolean;
}
