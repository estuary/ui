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
    encryptedEndpointConfig: { [key: string]: any },
    encryptedSuffix: string,
    overrideJsonFormDefaults?: boolean
) => {
    const response = {};
    Object.entries(encryptedEndpointConfig).forEach(([key, value]) => {
        // Check if key is a sops key.
        const encryptedSuffixIndex = key.lastIndexOf(encryptedSuffix);

        // If a sops key we need to strip the suffix off the end so the cloned
        //  object has the proper keys. Otherwise the ajv/json forms would throw
        //  errors for properties not in the schema being in the data
        const truncatedKey =
            encryptedSuffixIndex !== -1
                ? key.slice(0, encryptedSuffixIndex)
                : null;

        if (isPlainObject(value)) {
            // Handle nested objects

            // Check which key to use
            const keyToUse = truncatedKey ?? key;

            // Make sure the nested element is populated
            response[keyToUse] ??= {};

            // start recursion so we can clone deeply
            response[keyToUse] = copyEncryptedEndpointConfig(
                encryptedEndpointConfig[key],
                encryptedSuffix
            );
        } else if (overrideJsonFormDefaults && truncatedKey) {
            // handle populating encrypted keys/props
            response[truncatedKey] = value;
        } else if (!truncatedKey) {
            // handle populating unencrypted keys/props
            response[key] = value;
        }
    });

    return response;
};

export const parseEncryptedEndpointConfig = (
    endpointConfig: { [key: string]: any },
    endpointSchema: Schema,
    overrideJsonFormDefaults?: boolean
): JsonFormsData => {
    // This should ALMOST always be true. However, people can insert
    //      bad data and we just need to be safe.
    if (endpointConfig.sops) {
        const {
            sops: { encrypted_suffix },
            ...encryptedEndpointConfig
        } = endpointConfig;

        // Generate template and populate data
        const endpointConfigTemplate = createJSONFormDefaults(endpointSchema);
        endpointConfigTemplate.data = copyEncryptedEndpointConfig(
            encryptedEndpointConfig,
            encrypted_suffix,
            overrideJsonFormDefaults
        );

        return endpointConfigTemplate;
    } else {
        // If there is no SOPS then the data is not encrypted
        //      so we just return whatever was sent back in data.
        //  We are defaulting to empty errors because we assume
        //      the data is valid.
        return { data: endpointConfig, errors: [] };
    }
};

export async function encryptEndpointConfig(
    endpointConfig: { [key: string]: any },
    endpointSchema: Schema,
    serverUpdateRequired: boolean,
    imageConnectorId: string,
    imageConnectorTagId: string,
    callFailed: Function,
    { overrideJsonFormDefaults }: { overrideJsonFormDefaults: boolean }
): Promise<SupabaseInvokeResponse> {
    const selectedEndpointConfig =
        serverUpdateRequired && Object.hasOwn(endpointConfig, sopsKey)
            ? parseEncryptedEndpointConfig(
                  endpointConfig,
                  endpointSchema,
                  overrideJsonFormDefaults
              ).data
            : endpointConfig;

    let encryptedEndpointConfig: SupabaseInvokeResponse = {
        data: null,
        error: {
            name: 'Object Not Reassigned',
            message:
                'An object initializing the response of a Supabase function was not reassigned.',
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
