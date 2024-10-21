import { Chip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings_count,
    useBinding_collections_count,
} from 'stores/Binding/hooks';
import { useShallow } from 'zustand/react/shallow';
import { useBindingsEditorStore } from '../Store/create';
import { BackfillCountProps } from './types';

function BackfillCount({ disabled }: BackfillCountProps) {
    const intl = useIntl();
    const entityType = useEntityType();

    const evolvedCollectionsCount: number = useBindingsEditorStore(
        useShallow((state) => state.evolvedCollections.length)
    );
    const backfillCount = useBinding_backfilledBindings_count();
    const bindingsTotal = useBinding_collections_count();

    const calculatedCount = backfillCount + evolvedCollectionsCount;

    // Only reason noBackfill is in here is because we are already running the memo on backfillCount change
    const [noBackfill, itemType_backfill, itemType_bindings] = useMemo(() => {
        const itemTypeKey =
            entityType === 'capture'
                ? 'terms.bindings.plural'
                : 'terms.collections.plural';

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
