import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import {
    useBinding_backfilledBindings_count,
    useBinding_collections_count,
    useBinding_evolvedCollections_count,
} from 'src/stores/Binding/hooks';

export const useBackfillCountMessage = (disabled?: boolean) => {
    const intl = useIntl();
    const entityType = useEntityType();

    const evolvedCollectionsCount = useBinding_evolvedCollections_count();
    const backfillCount = useBinding_backfilledBindings_count();
    const bindingsTotal = useBinding_collections_count();

    // We shouldn't have any overlap (duplicate counting) with manual backfilling because backfill button is disabled
    //  when evolved. So only time we could get duplicate counting is from the backfill all button
    const calculatedCount =
        backfillCount === bindingsTotal
            ? backfillCount
            : backfillCount + evolvedCollectionsCount;

    // Only reason noBackfill is in here is because we are already running the memo on backfillCount change
    const [noBackfill, itemType_backfill, itemType_bindings] = useMemo(() => {
        const itemTypeKey = ENTITY_SETTINGS[entityType].bindingTermId;

        return [
            calculatedCount < 1,
            intl.formatMessage(
                {
                    id: itemTypeKey,
                },
                { count: calculatedCount }
            ),
            intl.formatMessage(
                {
                    id: itemTypeKey,
                },
                { count: calculatedCount }
            ),
        ];
    }, [calculatedCount, entityType, intl]);

    const label = useMemo(
        () =>
            disabled
                ? intl.formatMessage(
                      {
                          id: 'workflows.collectionSelector.manualBackfill.count.disabled',
                      },
                      {
                          itemType: itemType_bindings,
                      }
                  )
                : noBackfill
                  ? intl.formatMessage(
                        {
                            id: 'workflows.collectionSelector.manualBackfill.count.empty',
                        },
                        {
                            itemType: itemType_backfill,
                        }
                    )
                  : intl.formatMessage(
                        {
                            id: 'workflows.collectionSelector.manualBackfill.count',
                        },
                        {
                            backfillCount: calculatedCount,
                            bindingsTotal,
                            itemType: itemType_bindings,
                        }
                    ),
        [
            bindingsTotal,
            calculatedCount,
            disabled,
            intl,
            itemType_backfill,
            itemType_bindings,
            noBackfill,
        ]
    );

    return {
        calculatedCount,
        label,
        noBackfill,
        itemType_backfill,
        itemType_bindings,
    };
};
