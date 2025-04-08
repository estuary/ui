import { useCallback } from 'react';

import { isEqual } from 'lodash';

import { getStorageMappingStores } from 'src/api/storageMappings';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { hasLength } from 'src/utils/misc-utils';

const ESTUARY_TRIAL_STORAGE = {
    provider: 'GCS',
    bucket: 'estuary-trial',
    prefix: 'collection-data/',
};

const getTrialPrefixes = async (prefixes: string[]): Promise<string[]> => {
    const { data, error } = await getStorageMappingStores(prefixes);

    if (error || !data) {
        logRocketEvent(CustomEvents.TRIAL_STORAGE, { prefixes, error });

        return [];
    }

    return data
        .filter(
            ({ spec }) =>
                spec.stores.length === 1 &&
                isEqual(data[0].spec.stores[0], ESTUARY_TRIAL_STORAGE)
        )
        .map(({ catalog_prefix }) => catalog_prefix);
};

export default function useTrialPrefixes() {
    const objectRoles = useEntitiesStore_capabilities_adminable();

    return useCallback(
        async (prefixes: string[]) => {
            if (!hasLength(prefixes)) {
                return [];
            }

            const filteredPrefixes = prefixes.filter((prefix) =>
                objectRoles.includes(prefix)
            );

            if (!hasLength(filteredPrefixes)) {
                return [];
            }

            const trialPrefixes = await getTrialPrefixes(filteredPrefixes);

            return trialPrefixes;
        },
        [objectRoles]
    );
}
