import type { TargetNamingStrategy } from 'src/types';

import { useCallback } from 'react';

import useDraftUpdater from 'src/hooks/useDraftUpdater';

// Writes or removes spec.targetNaming on the root of the materialization draft spec.
// Pass undefined to remove the setting. Only call this for rootTargetNaming model specs.
export function useWriteRootTargetNaming() {
    const draftUpdater = useDraftUpdater();

    return useCallback(
        (strategy: TargetNamingStrategy | undefined) => {
            return draftUpdater(
                (spec) => {
                    if (strategy === undefined) {
                        delete spec.targetNaming;
                    } else {
                        spec.targetNaming = strategy;
                    }
                    return spec;
                },
                { spec_type: 'materialization' }
            );
        },
        [draftUpdater]
    );
}
