import { getStorageMappingStores } from 'api/storageMappings';
import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { useTrialMetadataStore } from 'stores/TrialMetadata/Store';
import { hasLength } from 'utils/misc-utils';

const ESTUARY_TRIAL_STORAGE = {
    provider: 'GCS',
    bucket: 'estuary-trial',
    prefix: 'collection-data/',
};

const getTrialStorageOnlyPrefixes = async (
    prefixes: string[]
): Promise<string[]> => {
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

export default function useTrialStorageOnly() {
    const objectRoles = useEntitiesStore_capabilities_adminable();

    const addTrialStorageOnly = useTrialMetadataStore(
        (state) => state.addTrialStorageOnly
    );

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

            const trialPrefixes = await getTrialStorageOnlyPrefixes(
                filteredPrefixes
            );

            addTrialStorageOnly(trialPrefixes);

            return trialPrefixes;
        },
        [addTrialStorageOnly, objectRoles]
    );
}
