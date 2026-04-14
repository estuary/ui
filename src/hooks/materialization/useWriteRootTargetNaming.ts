import type { TargetNamingStrategy } from 'src/types';

import { useCallback } from 'react';

import useDraftUpdater from 'src/hooks/useDraftUpdater';

// Writes spec.targetNaming to the root of the materialization draft spec.
// Only call this for rootTargetNaming model specs.
export function useWriteRootTargetNaming() {
    const draftUpdater = useDraftUpdater();

    return useCallback(
        (strategy: TargetNamingStrategy) => {
            return draftUpdater(
                (spec) => {
                    spec.targetNaming = strategy;
                    return spec;
                },
                { spec_type: 'materialization' }
            );
        },
        [draftUpdater]
    );
}
