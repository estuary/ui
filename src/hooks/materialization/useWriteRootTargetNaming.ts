import type { TargetNamingStrategy } from 'src/types';

import { useCallback } from 'react';

import useDraftUpdater from 'src/hooks/useDraftUpdater';
import { addOrRemoveTargetNaming } from 'src/utils/entity-utils';

// Writes or removes spec.targetNaming on the root of the materialization draft spec.
// Pass undefined to remove the setting. Only call this for rootTargetNaming model specs.
export function useWriteRootTargetNaming() {
    const draftUpdater = useDraftUpdater();

    return useCallback(
        (strategy: TargetNamingStrategy | null) => {
            return draftUpdater(
                (spec) => {
                    return addOrRemoveTargetNaming(spec, strategy);
                },
                { spec_type: 'materialization' }
            );
        },
        [draftUpdater]
    );
}
