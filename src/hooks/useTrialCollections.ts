import { getTrialCollections } from 'api/liveSpecsExt';
import { difference, uniq } from 'lodash';
import { useCallback, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBinding_collections } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useTrialMetadataStore } from 'stores/TrialMetadata/Store';
import { hasLength, stripPathing } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';
import useTrialStorageOnly from './useTrialStorageOnly';

export default function useTrialCollections() {
    const setTrialOnlyStorage = useBindingStore(
        (state) => state.setTrialOnlyStorage
    );
    const collections = useBinding_collections();

    const storedTrialPrefixes = useTrialMetadataStore(
        useShallow((state) => state.trialStorageOnly)
    );

    const getTrialOnlyPrefixes = useTrialStorageOnly();

    const existingPrefixes = useMemo(
        () =>
            uniq(
                collections.map((collection) => stripPathing(collection, true))
            ),
        [collections]
    );

    return useCallback(
        async (catalogNames?: string[]) => {
            const targetPrefixes = catalogNames
                ? uniq(catalogNames.map((name) => stripPathing(name, true)))
                : existingPrefixes;

            const newPrefixes = difference(targetPrefixes, storedTrialPrefixes);

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

            setTrialOnlyStorage(data);

            return data;
        },
        [
            existingPrefixes,
            getTrialOnlyPrefixes,
            setTrialOnlyStorage,
            storedTrialPrefixes,
        ]
    );
}
