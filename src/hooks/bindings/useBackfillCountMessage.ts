import { useMemo } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import {
    useBinding_collections_count,
    useBinding_enabledBackfilledBindings_count,
    useBinding_enabledEvolvedCollections_count,
} from 'src/stores/Binding/hooks';

export const useBackfillCountMessage = (disabled?: boolean) => {
    const entityType = useEntityType();

    // Disabled bindings are skipped when the task is published,
    // so count enabled bindings only.
    const evolvedCollectionsCount =
        useBinding_enabledEvolvedCollections_count();
    const backfillCount = useBinding_enabledBackfilledBindings_count();
    const bindingsTotal = useBinding_collections_count();

    // We shouldn't have any overlap (duplicate counting) with manual backfilling because backfill button is disabled
    // when evolved. So only time we could get duplicate counting is from the backfill all button
    const calculatedCount =
        backfillCount === bindingsTotal
            ? backfillCount
            : backfillCount + evolvedCollectionsCount;

    const noBackfill = calculatedCount < 1;

    const label = useMemo(() => {
        const { bindingTermSingular, bindingTermPlural } =
            ENTITY_SETTINGS[entityType];
        const bindingTerm =
            bindingsTotal === 1 ? bindingTermSingular : bindingTermPlural;

        if (disabled) {
            return `no ${bindingTermPlural} available to backfill`;
        }

        return noBackfill
            ? `no ${bindingTermPlural} marked for backfill`
            : `${calculatedCount} of ${bindingsTotal} ${bindingTerm} will be backfilled`;
    }, [bindingsTotal, calculatedCount, disabled, entityType, noBackfill]);

    return {
        calculatedCount,
        label,
        noBackfill,
    };
};
