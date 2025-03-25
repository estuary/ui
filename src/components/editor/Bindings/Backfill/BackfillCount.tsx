import type { BackfillCountProps } from './types';
import { Chip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings_count,
    useBinding_collections_count,
    useBinding_evolvedCollections_count,
} from 'stores/Binding/hooks';
import { ENTITY_SETTINGS } from 'settings/entity';

function BackfillCount({ disabled }: BackfillCountProps) {
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

    return (
        <Chip
            aria-label={intl.formatMessage({
                id: 'workflows.collectionSelector.manualBackfill.count.aria',
            })}
            color={noBackfill || disabled ? 'info' : 'success'}
            variant="outlined"
            label={
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
                      )
            }
        />
    );
}

export default BackfillCount;
