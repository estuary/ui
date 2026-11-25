import { useEffect, useMemo } from 'react';

import { isPlainObject } from 'lodash';
import { useLocalStorage } from 'react-use';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_hasStoredSecrets,
    useEndpointConfigStore_sopsPinned,
} from 'src/stores/EndpointConfig/hooks';
import { Annotations } from 'src/types/jsonforms';
import { isDekafConnector } from 'src/utils/connector-utils';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';
import { hasArraySecret } from 'src/utils/secrets-utils';

type SecretStorage = 'sops' | 'secrets';

/**
 * Where the task's secrets are stored: sealed in its config with `sops`, or
 * as catalog secrets named in its `secrets` stanza. Dekaf and OAuth tasks,
 * tasks with secrets in arrays, and tasks already on sops, stay on sops. A task that already has a stanza
 * keeps it. Otherwise, secrets are used only when the flow is enabled.
 */
export function useSecretStorage(): SecretStorage {
    const dekaf = useDetailsFormStore((state) =>
        isDekafConnector(state.details.data.connectorImage)
    );
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const sopsPinned = useEndpointConfigStore_sopsPinned();
    const hasStoredSecrets = useEndpointConfigStore_hasStoredSecrets();
    const enabled = useSecretsFlowEnabled();

    // memoized so it doesn't have to walk the schema tree on every render
    const oAuth = useMemo(
        () => hasOAuthProvider(endpointSchema),
        [endpointSchema]
    );
    const arraySecret = useMemo(
        () => hasArraySecret(endpointSchema),
        [endpointSchema]
    );

    if (dekaf || sopsPinned || oAuth || arraySecret) {
        return 'sops';
    }

    return enabled || hasStoredSecrets ? 'secrets' : 'sops';
}

// Whether new tasks use secrets, from `?secrets=true|false`. The last value
// is remembered, so it survives navigating without the param.
function useSecretsFlowEnabled() {
    const urlFlag = parseFlag(
        useGlobalSearchParams<string | null>(GlobalSearchParams.SECRETS)
    );
    const [storedFlag, setStoredFlag] = useLocalStorage<boolean>(
        LocalStorageKeys.SECRETS_FLOW,
        false
    );

    useEffect(() => {
        if (urlFlag !== undefined && urlFlag !== storedFlag) {
            setStoredFlag(urlFlag);
        }
    }, [setStoredFlag, storedFlag, urlFlag]);

    return urlFlag ?? storedFlag ?? false;
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

function parseFlag(value: string | null) {
    return value === 'true' ? true : value === 'false' ? false : undefined;
}
