import type { JsonFormsData, Schema, SupabaseInvokeResponse } from 'src/types';

import { isPlainObject } from 'lodash';

import { encryptConfig } from 'src/api/oauth';
import { createJSONFormDefaults } from 'src/services/ajv';

const sopsKey = 'sops';

// This is mainly public so we can test easier. If you think
//  you need to call this directly think about it A LOT and
//  talk it through with the team first.
export const copyEncryptedEndpointConfig = (
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
        const keyToUse = truncatedKey ?? key;

        if (Array.isArray(value)) {
            // TODO (SOPS array) - if we add support for encrypted arrays then
            //  this is where it would go and maybe something like below:
            // if truncatedKey response[keyToUse] = value.map(() => null) else
            response[keyToUse] = value.map((item) => {
                if (isPlainObject(item)) {
                    return copyEncryptedEndpointConfig(
                        item,
                        encryptedSuffix,
                        overrideJsonFormDefaults
                    );
                }

                return item;
            });
        } else if (isPlainObject(value)) {
            // Make sure the nested element is populated
            response[keyToUse] ??= {};

            // start recursion so we can clone deeply
            response[keyToUse] = copyEncryptedEndpointConfig(
                encryptedEndpointConfig[key],
                encryptedSuffix,
                overrideJsonFormDefaults
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
): Promise<SupabaseInvokeResponse<any>> {
    const selectedEndpointConfig =
        serverUpdateRequired && Object.hasOwn(endpointConfig, sopsKey)
            ? parseEncryptedEndpointConfig(
                  endpointConfig,
                  endpointSchema,
                  overrideJsonFormDefaults
              ).data
            : endpointConfig;

    let encryptedEndpointConfig: SupabaseInvokeResponse<any> = {
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
