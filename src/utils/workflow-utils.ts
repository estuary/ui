import { encryptConfig } from 'api/oauth';
import { createJSONFormDefaults } from 'services/ajv';
import { JsonFormsData, Schema } from 'types';

// TODO (typing): Consider adding a type annotation for the promise returned by
//   the invokeSupabase() function (i.e., src/services/supabase.ts).
type SupabaseInvokeResponse =
    | { data: null; error: Error }
    | { data: any; error: null };

const parseEncryptedEndpointConfig = (
    endpointConfig: { [key: string]: any },
    endpointSchema: Schema
): JsonFormsData => {
    const {
        sops: { encrypted_suffix },
        ...rawEndpointConfig
    } = endpointConfig;

    const endpointConfigTemplate = createJSONFormDefaults(endpointSchema);

    console.log('ENDPOINT TEMPLATE');
    console.log(endpointConfigTemplate);

    Object.entries(rawEndpointConfig).forEach(([key, value]) => {
        let truncatedKey = '';
        const encryptedSuffixIndex = key.lastIndexOf(encrypted_suffix);

        if (encryptedSuffixIndex !== -1) {
            console.log('Sops encrypted key:', key);

            truncatedKey = key.slice(0, encryptedSuffixIndex);
        }

        endpointConfigTemplate.data[truncatedKey || key] = value;
    });

    console.log('ENDPOINT PARSED');
    console.log(endpointConfigTemplate);

    return endpointConfigTemplate;
};

export async function encryptEndpointConfig(
    endpointConfig: { [key: string]: any },
    endpointSchema: Schema,
    serverUpdateRequired: boolean,
    imageConnectorId: string,
    imageConnectorTagId: string,
    callFailed: Function
): Promise<SupabaseInvokeResponse> {
    const selectedEndpointConfig =
        serverUpdateRequired && Object.hasOwn(endpointConfig, 'sops')
            ? parseEncryptedEndpointConfig(endpointConfig, endpointSchema).data
            : endpointConfig;

    let encryptedEndpointConfig: SupabaseInvokeResponse = {
        data: null,
        error: {
            name: 'Object Not Reassigned',
            message:
                'An object initializing a the response of a Supabase function was not reassigned.',
        },
    };

    if (Object.hasOwn(selectedEndpointConfig, 'sops')) {
        encryptedEndpointConfig = { data: endpointConfig, error: null };
    } else {
        encryptedEndpointConfig = await encryptConfig(
            imageConnectorId,
            imageConnectorTagId,
            selectedEndpointConfig
        );
        if (
            encryptedEndpointConfig.error ||
            encryptedEndpointConfig.data.error
        ) {
            return callFailed({
                error: {
                    title: 'entityCreate.sops.failedTitle',
                    error:
                        encryptedEndpointConfig.error ??
                        encryptedEndpointConfig.data.error,
                },
            });
        }
    }

    return encryptedEndpointConfig;
}
