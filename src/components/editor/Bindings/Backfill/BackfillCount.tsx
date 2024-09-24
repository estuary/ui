import { Chip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings_count,
    useBinding_enabledCollections_count,
} from 'stores/Binding/hooks';
import { BackfillCountProps } from './types';

function BackfillCount({ disabled }: BackfillCountProps) {
    const intl = useIntl();
    const entityType = useEntityType();

    const backfillCount = useBinding_backfilledBindings_count();
    const bindingsTotal = useBinding_enabledCollections_count();

    // Only reason noBackfill is in here is because we are already running the memo on backfillCount change
    const [noBackfill, itemType_backfill, itemType_bindings] = useMemo(() => {
        const itemTypeKey =
            entityType === 'capture'
                ? 'terms.bindings.plural'
                : 'terms.collections.plural';

        return [
            backfillCount < 1,
            intl.formatMessage(
                {
                    id: itemTypeKey,
                },
                { count: backfillCount }
            ),
            intl.formatMessage(
                {
                    id: itemTypeKey,
                },
                { count: bindingsTotal }
            ),
        ];
    }, [backfillCount, bindingsTotal, entityType, intl]);

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
                              backfillCount,
                              bindingsTotal,
                              itemType: itemType_bindings,
                          }
                      )
            }
        />
    );
}

export default BackfillCount;
