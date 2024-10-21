import { Chip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_evolvedCollections_count } from 'stores/Binding/hooks';

function EvolvedCount() {
    const intl = useIntl();
    const entityType = useEntityType();

    const evolvedCollectionsCount = useBinding_evolvedCollections_count();

    // Only reason noBackfill is in here is because we are already running the memo on backfillCount change
    const [noEvolvedCollections, itemType_bindings] = useMemo(() => {
        const itemTypeKey =
            entityType === 'capture'
                ? 'terms.bindings.plural'
                : 'terms.collections.plural';

        return [
            evolvedCollectionsCount < 1,
            intl.formatMessage(
                {
                    id: itemTypeKey,
                },
                { count: evolvedCollectionsCount }
            ),
        ];
    }, [entityType, evolvedCollectionsCount, intl]);

    if (noEvolvedCollections) {
        return null;
    }

    return (
        <Chip
            aria-label={intl.formatMessage({
                id: 'workflows.collectionSelector.manualBackfill.count.aria',
            })}
            color="info"
            variant="outlined"
            label={intl.formatMessage(
                {
                    id: 'workflows.collectionSelector.evolvedCollections.count',
                },
                {
                    count: evolvedCollectionsCount,
                    itemType: itemType_bindings,
                }
            )}
        />
    );
}

export default EvolvedCount;
