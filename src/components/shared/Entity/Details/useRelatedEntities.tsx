import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import RelatedEntities from 'src/components/shared/Entity/Details/RelatedEntities';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';

function useRelatedEntities() {
    const intl = useIntl();
    const entityType = useEntityType();

    const [relatedCaptures, relatedMaterializations, hydrationError] =
        useEntityRelationshipStore((state) => [
            state.captures,
            state.materializations,
            state.hydrationError,
        ]);

    return useMemo(() => {
        const response = [];

        if (entityType === 'collection') {
            response.push({
                title: intl.formatMessage({
                    id: 'data.parentCapture',
                }),
                val: (
                    <RelatedEntities
                        entityType="capture"
                        entities={relatedCaptures}
                        error={Boolean(hydrationError)}
                    />
                ),
            });

            response.push({
                title: intl.formatMessage({
                    id: 'data.consumers',
                }),
                val: (
                    <RelatedEntities
                        entityType="materialization"
                        entities={relatedMaterializations}
                        error={Boolean(hydrationError)}
                    />
                ),
            });
        }

        return response;
    }, [
        entityType,
        hydrationError,
        intl,
        relatedCaptures,
        relatedMaterializations,
    ]);
}

export default useRelatedEntities;
