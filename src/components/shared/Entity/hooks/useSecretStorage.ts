import { useMemo } from 'react';

import { isPlainObject } from 'lodash';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_sopsPinned,
} from 'src/stores/EndpointConfig/hooks';
import { Annotations } from 'src/types/jsonforms';
import { isDekafConnector } from 'src/utils/connector-utils';
import { hasArraySecret } from 'src/utils/secrets-utils';

type SecretStorage = 'sops' | 'secrets';

/**
 * Where the task's secrets are stored: as catalog secrets named in its
 * `secrets` stanza, or sealed in its config with `sops`. Dekaf and OAuth
 * tasks, tasks with secrets in arrays, and tasks already on sops or pinned to
 * runtime v1, stay on sops.
 */
export function useSecretStorage(): SecretStorage {
    const dekaf = useDetailsFormStore((state) =>
        isDekafConnector(state.details.data.connectorImage)
    );
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const sopsPinned = useEndpointConfigStore_sopsPinned();

    // memoized so it doesn't have to walk the schema tree on every render
    const oAuth = useMemo(
        () => hasOAuthProvider(endpointSchema),
        [endpointSchema]
    );
    const arraySecret = useMemo(
        () => hasArraySecret(endpointSchema),
        [endpointSchema]
    );

    return dekaf || sopsPinned || oAuth || arraySecret ? 'sops' : 'secrets';
}

function hasOAuthProvider(node: unknown): boolean {
    if (Array.isArray(node)) {
        return node.some(hasOAuthProvider);
    }
    if (!isPlainObject(node)) {
        return false;
    }

    return (
        Object.hasOwn(node as object, Annotations.oAuthProvider) ||
        Object.values(node as object).some(hasOAuthProvider)
    );
}
