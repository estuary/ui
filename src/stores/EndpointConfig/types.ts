import type { StoreWithCustomErrors } from 'src/stores/extensions/CustomErrors';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { JsonFormsData, Schema } from 'src/types';

export interface EndpointConfigState
    extends StoreWithHydration,
        StoreWithCustomErrors {
    endpointSchema: Schema;
    setEndpointSchema: (
        val: EndpointConfigState['endpointSchema']
    ) => Promise<void>;

    // Encrypted Endpoint Configs
    publishedEndpointConfig: JsonFormsData;
    setPublishedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['publishedEndpointConfig']
    ) => void;

    // The config as last loaded or written to the draft: sops encrypted, or
    // plaintext without its secrets
    encryptedEndpointConfig: JsonFormsData;

    // JSON Form Compatible-Endpoint Configs
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    // The value last entered in each field, kept while the field is out of the
    // form, e.g. in a union option not selected. Kept by the store.
    previousEndpointConfig: JsonFormsData['data'];

    // The form's config when it was last loaded or written, which edits are
    // compared with. Set from the config as loaded or written, with its
    // `secrets` stanza, if any: a plaintext config becomes the form's config
    // too, while a sops one leaves the form as it is.
    savedEndpointConfig: JsonFormsData;
    setSavedEndpointConfig: (
        config: Schema,
        secrets?: Record<string, string> | null
    ) => void;

    errorsExist: boolean;
    endpointConfigErrors: { message: string | undefined }[];

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    // The task must stay on sops, e.g. it's already sops encrypted
    sopsPinned: boolean;
    setSopsPinned: (value: boolean) => void;

    // The task's stored secrets, by the pointer they're merged at: every one
    // loaded or written, until its field is cleared. And the stanza last
    // loaded or written, which edits are compared with.
    secretNames: Record<string, string>;
    savedSecretNames: Record<string, string>;
    // The stored secrets in use: under fields that still exist, in each
    // union's selected option. Derived; only the config and the stored secrets
    // change it, not selecting an option, so it follows the form's data.
    activeSecretNames: Record<string, string>;
    // A secret field at `pointer` was cleared, so its stored secret, and those
    // of anything under it, are no longer used
    clearStoredSecrets: (pointer: string) => void;

    // The option selected in each union, by union pointer
    selectedOptions: Record<string, number>;
    initializeSelectedOptions: (
        selectedOptions: Record<string, number>
    ) => void;
    // The union at `pointer` selected `option`. Its data becomes `defaults`
    // with the option's own `fields` as last entered, which it resolves to, so
    // the form can set the same.
    switchOption: (
        pointer: string,
        option: number,
        defaults: unknown,
        fields: string[]
    ) => unknown;

    // Storing if the endpoint config is allowed to be empty
    endpointCanBeEmpty: boolean;
    setEndpointCanBeEmpty: (value: boolean) => void;

    // Misc.
    resetState: () => void;
}
