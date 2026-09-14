import { useMemo } from 'react';

import { Chip } from '@mui/material';

import { useIntl } from 'react-intl';

import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useBinding_evolvedCollections_count } from 'src/stores/Binding/hooks';

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
            label={`${evolvedCollectionsCount} ${itemType_bindings} reversioning`}
            aria-label="Backfill count"
            color="info"
            variant="outlined"
        />
    );
}

export default EvolvedCount;
