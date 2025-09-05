import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import RelatedEntities from 'src/components/shared/Entity/Details/RelatedEntities';
import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';

function useRelatedEntities() {
    const intl = useIntl();
    const entityType = useEntityType();

    const [
        relatedCaptures,
        relatedMaterializations,
        relatedCollections,
        hydrationError,
        hydrated,
    ] = useEntityRelationshipStore((state) => [
        state.captures,
        state.materializations,
        state.collections,
        state.hydrationError,
        state.hydrated,
    ]);

    return useMemo(() => {
        const response = [];

        if (
            ENTITY_SETTINGS[entityType].details.relatedEntitiesContentIds
                .writtenBy
        ) {
            response.push({
                title: intl.formatMessage({
                    id: ENTITY_SETTINGS[entityType].details
                        .relatedEntitiesContentIds.writtenBy,
                }),
                val: (
                    <RelatedEntities
                        entityType="capture"
                        entities={hydrated ? relatedCaptures : null}
                        error={Boolean(hydrationError)}
                    />
                ),
            });
        }

        if (
            ENTITY_SETTINGS[entityType].details.relatedEntitiesContentIds
                .collections
        ) {
            response.push({
                title: intl.formatMessage({
                    id: ENTITY_SETTINGS[entityType].details
                        .relatedEntitiesContentIds.collections,
                }),
                val: (
                    <RelatedEntities
                        entityType="collection"
                        entities={hydrated ? relatedCollections : null}
                        error={Boolean(hydrationError)}
                    />
                ),
            });
        }

        if (
            ENTITY_SETTINGS[entityType].details.relatedEntitiesContentIds.readBy
        ) {
            response.push({
                title: intl.formatMessage({
                    id: ENTITY_SETTINGS[entityType].details
                        .relatedEntitiesContentIds.readBy,
                }),
                val: (
                    <RelatedEntities
                        entityType="materialization"
                        entities={hydrated ? relatedMaterializations : null}
                        error={Boolean(hydrationError)}
                    />
                ),
            });
        }

        return response;
    }, [
        entityType,
        hydrated,
        hydrationError,
        intl,
        relatedCaptures,
        relatedCollections,
        relatedMaterializations,
    ]);
}

export default useRelatedEntities;
