import type { FormError } from 'src/stores/FormState/types';
import type { Schema } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useEncryptEndpointConfig } from 'src/components/shared/Entity/hooks/useEncryptEndpointConfig';
import { useSecretStorage } from 'src/components/shared/Entity/hooks/useSecretStorage';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import {
    useEndpointConfigStore_activeSecretNames,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_savedSecretNames,
} from 'src/stores/EndpointConfig/hooks';
import { buildSecretsWrite } from 'src/utils/secrets-utils';

const ERROR_TITLE = 'entityCreate.sops.failedTitle';

interface WrittenEndpointConfig {
    config: Schema;
    // The task's `secrets` stanza, or null when it's on sops
    secrets: Record<string, string> | null;
}

/**
 * Callback hook that resolves to the endpoint config to write to the draft.
 * On sops, the config is encrypted. Otherwise, each secret value entered in
 * the form is set as a catalog secret and removed from the config, and the
 * `secrets` stanza names those along with the task's stored secrets.
 */
export function useWriteEndpointConfig() {
    const isEdit = useEntityWorkflow_Editing();
    const secretStorage = useSecretStorage();
    const encryptEndpointConfig = useEncryptEndpointConfig();
    const setSecret = useSetSecret();

    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const activeSecretNames = useEndpointConfigStore_activeSecretNames();
    const savedSecretNames = useEndpointConfigStore_savedSecretNames();

    return useCallback(
        async (
            catalogName: string
        ): Promise<Result<WrittenEndpointConfig, FormError>> => {
            if (secretStorage === 'sops') {
                const { value, error } = await encryptEndpointConfig();

                return error
                    ? { error }
                    : { value: { config: value, secrets: null } };
            }

            let write;
            try {
                write = buildSecretsWrite(
                    endpointSchema,
                    endpointConfigData,
                    activeSecretNames,
                    savedSecretNames,
                    catalogName,
                    isEdit
                );
            } catch (error: unknown) {
                return {
                    error: { title: ERROR_TITLE, error: error as Error },
                };
            }

            try {
                await Promise.all(
                    write.values.map(([name, value]) => setSecret(name, value))
                );
            } catch (error: unknown) {
                return {
                    error: { title: ERROR_TITLE, error: error as Error },
                };
            }

            return {
                value: { config: write.config, secrets: write.secrets },
            };
        },
        [
            encryptEndpointConfig,
            endpointConfigData,
            endpointSchema,
            isEdit,
            activeSecretNames,
            savedSecretNames,
            secretStorage,
            setSecret,
        ]
    );
}
