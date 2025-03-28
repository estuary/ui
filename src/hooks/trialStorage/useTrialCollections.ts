import { useCallback } from 'react';

import useTrialPrefixes from './useTrialPrefixes';
import { uniq } from 'lodash';

import { getTrialCollections } from 'src/api/liveSpecsExt';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { hasLength, stripPathing } from 'src/utils/misc-utils';

// This function was created and exported so the binding store hydrator
// can use the same logic to evaluate trial collection as the core hook.
export const evaluateTrialCollections = async (
    catalogNames: string[] | undefined,
    getTrialPrefixes: (prefixes: string[]) => Promise<string[]>
) => {
    const prefixes = catalogNames
        ? uniq(catalogNames.map((name) => stripPathing(name, true)))
        : [];

    if (!hasLength(prefixes) || !catalogNames) {
        return [];
    }

    const trialPrefixes = await getTrialPrefixes(prefixes);

    const { data, error } = await getTrialCollections(
        trialPrefixes,
        catalogNames
    );

    if (error) {
        logRocketEvent(CustomEvents.TRIAL_STORAGE, {
            prefixes: trialPrefixes,
            error,
        });

        return [];
    }

    return data;
};

export default function useTrialCollections() {
    const getTrialPrefixes = useTrialPrefixes();

    return useCallback(
        async (catalogNames?: string[]) => {
            const trialCollections = await evaluateTrialCollections(
                catalogNames,
                getTrialPrefixes
            );

            return trialCollections;
        },
        [getTrialPrefixes]
    );
}
