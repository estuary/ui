import type { SpecDef } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { decodePointer } from 'json-ptr';

import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import {
    useSecretsStore_secretNames,
    useSecretsStore_secretValues,
    useSecretsStore_serverUpdateRequired,
    useSecretsStore_setSecretName,
    useSecretsStore_usesSecrets,
} from 'src/stores/Secrets/hooks';
import { getEndpointFromSpecDef } from 'src/utils/connector-utils';
import { normalizeError } from 'src/utils/errors';
import {
    buildSecretsStanza,
    getSecretName,
    isSetValue,
    removeSecretValues,
    setSecretsStanza,
} from 'src/utils/secrets-utils';

// Saves the Secrets store's values under names from the task's, and sets the
// spec's `secrets` stanza to refer to them. Call it on the spec right before
// it's written to the draft, then mark the secrets saved once it is. Does
// nothing for a task that uses sops. Returns the error, if any.
//
// Values are only held in create, where the task's name can change until the
// draft is made. They're kept so a renamed task saves them again under its new
// names.
export function useAddSecretsToSpecDef() {
    const setSecret = useSetSecret();

    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();

    const usesSecrets = useSecretsStore_usesSecrets();
    const secretNames = useSecretsStore_secretNames();
    const secretValues = useSecretsStore_secretValues();
    const secretsServerUpdateRequired = useSecretsStore_serverUpdateRequired();
    const setSecretName = useSecretsStore_setSecretName();

    return useCallback(
        async (catalogName: string, specDef: SpecDef) => {
            if (!usesSecrets) {
                return null;
            }

            const names = { ...secretNames };

            try {
                for (const [pointer, value] of Object.entries(secretValues)) {
                    if (!isSetValue(value)) {
                        continue;
                    }

                    const name = getSecretName(
                        catalogName,
                        decodePointer(pointer).join('.')
                    );

                    if (
                        name !== names[pointer] ||
                        secretsServerUpdateRequired
                    ) {
                        await setSecret(name, value);
                        setSecretName(pointer, name);
                        names[pointer] = name;
                    }
                }
            } catch (error) {
                return normalizeError(error);
            }

            setSecretsStanza(
                specDef,
                buildSecretsStanza(endpointSchema, endpointConfig, names)
            );

            // Secret values live in secrets. Publication rejects any value
            // drafted at a secret field, even an empty one.
            const endpoint = getEndpointFromSpecDef(specDef);
            if (endpoint?.config) {
                endpoint.config = removeSecretValues(
                    endpointSchema,
                    endpoint.config
                );
            }

            return null;
        },
        [
            endpointConfig,
            endpointSchema,
            secretNames,
            secretValues,
            secretsServerUpdateRequired,
            setSecret,
            setSecretName,
            usesSecrets,
        ]
    );
}
