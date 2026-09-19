import type { Entity } from 'src/types';

import { useMemo } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import {
    useBinding_bindingsToBackfill_count,
    useBinding_collections_count,
} from 'src/stores/Binding/hooks';

const BINDING_TERMS: Record<Entity, [string, string]> = {
    capture: ['collection', 'collections'],
    collection: ['collection', 'collections'],
    materialization: ['destination table', 'destination tables'],
};

export const useBackfillCountMessage = (disabled?: boolean) => {
    const entityType = useEntityType();

    const backfillCount = useBinding_bindingsToBackfill_count();
    const bindingsTotal = useBinding_collections_count();
    const noBackfill = backfillCount < 1;

    const label = useMemo(() => {
        const [bindingTermSingular, bindingTermPlural] =
            BINDING_TERMS[entityType];
        const bindingTerm =
            bindingsTotal === 1 ? bindingTermSingular : bindingTermPlural;
        if (disabled) {
            return `no ${bindingTermPlural} available to backfill`;
        }

        return noBackfill
            ? `no ${bindingTermPlural} marked for backfill`
            : `${backfillCount} of ${bindingsTotal} ${bindingTerm} will be backfilled`;
    }, [bindingsTotal, backfillCount, disabled, entityType, noBackfill]);

    return {
        backfillCount,
        label,
        noBackfill,
    };
};
