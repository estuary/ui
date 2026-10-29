import { useCallback } from 'react';

import { decodePointer } from 'json-ptr';
import { isEmpty, isEqual } from 'lodash';

import {
    createDraftSpec,
    getDraftSpecsByDraftId,
    modifyDraftSpec,
} from 'src/api/draftSpecs';
import { useEntityType } from 'src/context/EntityContext';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import {
    useSecretsStore_secretNames,
    useSecretsStore_secretValues,
    useSecretsStore_serverUpdateRequired,
    useSecretsStore_setSecretName,
    useSecretsStore_setSecretsSaved,
    useSecretsStore_usesSecrets,
} from 'src/stores/Secrets/hooks';
import { normalizeError } from 'src/utils/errors';
import {
    buildSecretsStanza,
    getSecretName,
    setSecretsStanza,
} from 'src/utils/secrets-utils';
import { NEW_TASK_PUBLICATION_ID } from 'src/utils/workflow-utils';

// For a draft with no task spec yet (a capture's first discover)
interface NewTaskSpec {
    catalogName: string;
    endpoint: Record<string, unknown>;
}

// Writes the Secrets store to a draft: saves held values under names from the
// task's, and sets the task spec's `secrets` stanza. Runs right before anything
// runs the connector against the draft (a discover or a publication), since
// that's when the secrets have to resolve. Does nothing for a task that uses
// sops. Returns the error, if any.
//
// Values are only held in create, where the task's name can change until the
// draft is made. They're kept so a renamed task saves them again under its new
// names.
export function useSyncSecretsToDraft() {
    const entityType = useEntityType();
    const setSecret = useSetSecret();

    const endpointSchema = useEndpointConfigStore(
        (state) => state.endpointSchema
    );
    const endpointConfig = useEndpointConfigStore(
        (state) => state.endpointConfig.data
    );

    const usesSecrets = useSecretsStore_usesSecrets();
    const secretNames = useSecretsStore_secretNames();
    const secretValues = useSecretsStore_secretValues();
    const secretsServerUpdateRequired = useSecretsStore_serverUpdateRequired();
    const setSecretName = useSecretsStore_setSecretName();
    const setSecretsSaved = useSecretsStore_setSecretsSaved();

    return useCallback(
        async (draftId: string, newTaskSpec?: NewTaskSpec) => {
            if (!usesSecrets) {
                return null;
            }

            const existing = await getDraftSpecsByDraftId(draftId, entityType);
            if (existing.error) {
                return existing.error;
            }

            const taskSpec = existing.data?.[0];
            const catalogName =
                taskSpec?.catalog_name ?? newTaskSpec?.catalogName;

            const names = { ...secretNames };

            if (catalogName) {
                try {
                    for (const [pointer, value] of Object.entries(
                        secretValues
                    )) {
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
                    return normalizeError(error) ?? null;
                }
            }

            const stanza = buildSecretsStanza(
                endpointSchema,
                endpointConfig,
                names
            );

            if (taskSpec) {
                const spec = { ...taskSpec.spec };
                setSecretsStanza(spec, stanza);

                if (!isEqual(spec.secrets, taskSpec.spec.secrets)) {
                    const response = await modifyDraftSpec(spec, {
                        draft_id: draftId,
                        catalog_name: taskSpec.catalog_name,
                    });

                    if (response.error) {
                        return response.error;
                    }
                }
            } else if (newTaskSpec && !isEmpty(stanza)) {
                const response = await createDraftSpec(
                    draftId,
                    newTaskSpec.catalogName,
                    {
                        endpoint: newTaskSpec.endpoint,
                        bindings: [],
                        secrets: stanza,
                    },
                    entityType,
                    NEW_TASK_PUBLICATION_ID
                );

                if (response.error) {
                    return response.error;
                }
            }

            setSecretsSaved();

            return null;
        },
        [
            endpointConfig,
            endpointSchema,
            entityType,
            secretNames,
            secretValues,
            secretsServerUpdateRequired,
            setSecret,
            setSecretName,
            setSecretsSaved,
            usesSecrets,
        ]
    );
}
