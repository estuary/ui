import { getTrialCollections } from 'api/liveSpecsExt';
import { difference, uniq } from 'lodash';
import { useCallback } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useTrialMetadataStore } from 'stores/TrialMetadata/Store';
import { hasLength, stripPathing } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';
import useTrialStorageOnly from './useTrialStorageOnly';

export default function useTrialCollections() {
    const storedTrialPrefixes = useTrialMetadataStore(
        useShallow((state) => state.trialStorageOnly)
    );

    const getTrialOnlyPrefixes = useTrialStorageOnly();

    return useCallback(
        async (catalogNames?: string[]) => {
            const targetPrefixes = catalogNames
                ? uniq(catalogNames.map((name) => stripPathing(name, true)))
                : [];

            const newPrefixes = hasLength(targetPrefixes)
                ? difference(targetPrefixes, storedTrialPrefixes)
                : [];

            if (hasLength(newPrefixes)) {
                await getTrialOnlyPrefixes(newPrefixes);
            }

            const { data, error } = await getTrialCollections(targetPrefixes);

            if (error) {
                logRocketEvent(CustomEvents.TRIAL_STORAGE_COLLECTION_ERROR, {
                    prefixes: targetPrefixes,
                    error,
                });

                return [];
            }

            return data;
        },
        [getTrialOnlyPrefixes, storedTrialPrefixes]
    );
}
