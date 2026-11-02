import { useCallback } from 'react';

import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';
import { getEncryptionSettings } from 'src/utils/env-utils';

const SET_SECRET = graphql(`
    mutation SetSecret($catalogName: Name!, $document: JSON!) {
        setSecret(catalogName: $catalogName, document: $document) {
            changed
            secret {
                catalogName
                secretId
            }
        }
    }
`);

export function useSetSecret() {
    const [, setSecret] = useMutation(SET_SECRET);

    return useCallback(
        async (secretName: string, value: string) => {
            const document = await encryptSecret(secretName, value);

            const result = await setSecret({
                catalogName: secretName,
                document,
            });
            if (result.error) {
                throw result.error;
            }

            return result.data?.setSecret;
        },
        [setSecret]
    );
}

async function encryptSecret(
    secretName: string,
    value: string
): Promise<unknown> {
    // regular fetch since the shared client logs failed requests,
    // which we don't want for this call
    const response = await fetch(getSecretEncryptUrl(secretName), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(
            message || `Encryption failed with status ${response.status}`
        );
    }

    return await response.json();
}

function getSecretEncryptUrl(secretName: string) {
    const { encryptionEndpoint } = getEncryptionSettings();
    const url = new URL('/secret/encrypt', encryptionEndpoint);
    url.searchParams.set('name', secretName);
    return url.toString();
}
