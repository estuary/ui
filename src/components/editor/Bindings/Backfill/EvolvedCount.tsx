import { Chip } from '@mui/material';
import { useEntityType } from 'src/context/EntityContext';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_evolvedCollections_count } from 'src/stores/Binding/hooks';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function EvolvedCount() {
    const intl = useIntl();
    const entityType = useEntityType();

    const evolvedCollectionsCount = useBinding_evolvedCollections_count();

    const [noEvolvedCollections, itemType_bindings] = useMemo(() => {
        return [
            evolvedCollectionsCount < 1,
            intl.formatMessage(
                {
                    id: ENTITY_SETTINGS[entityType].bindingTermId,
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
