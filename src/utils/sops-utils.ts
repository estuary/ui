import { encryptConfig } from 'api/oauth';
import { isPlainObject } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { JsonFormsData, Schema } from 'types';

// TODO (typing): Consider adding a type annotation for the promise returned by
//   the invokeSupabase() function (i.e., src/services/supabase.ts).
type SupabaseInvokeResponse =
    | { data: null; error: Error }
    | { data: any; error: null };

const sopsKey = 'sops';

const copyEncryptedEndpointConfig = (
    endpointConfigTemplate: { [key: string]: any },
    encryptedEndpointConfig: { [key: string]: any },
    encryptedSuffix: string
) => {
    Object.entries(encryptedEndpointConfig).forEach(([key, value]) => {
        let truncatedKey = '';
        const encryptedSuffixIndex = key.lastIndexOf(encryptedSuffix);

        if (encryptedSuffixIndex !== -1) {
            truncatedKey = key.slice(0, encryptedSuffixIndex);
        }

        if (isPlainObject(value)) {
            copyEncryptedEndpointConfig(
                endpointConfigTemplate[truncatedKey || key],
                encryptedEndpointConfig[key],
                encryptedSuffix
            );
        } else {
            endpointConfigTemplate[truncatedKey || key] = value;
        }
    });
};

const parseEncryptedEndpointConfig = (
    endpointConfig: { [key: string]: any },
    endpointSchema: Schema
): JsonFormsData => {
    const {
        sops: { encrypted_suffix },
        ...encryptedEndpointConfig
    } = endpointConfig;

    const endpointConfigTemplate = createJSONFormDefaults(endpointSchema);

    copyEncryptedEndpointConfig(
        endpointConfigTemplate.data,
        encryptedEndpointConfig,
        encrypted_suffix
    );

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
        serverUpdateRequired && Object.hasOwn(endpointConfig, sopsKey)
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

    if (Object.hasOwn(selectedEndpointConfig, sopsKey)) {
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
