import type { RelatedEntitiesProps } from 'src/components/shared/Entity/Details/RelatedEntities/types';

import ChipList from 'src/components/shared/ChipList';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function RelatedEntities({
    entities,
    entityType,
    error,
    newWindow,
}: RelatedEntitiesProps) {
    const { generatePath } = useDetailsNavigator(
        ENTITY_SETTINGS[entityType].routes.details
    );

    if (error) {
        return (
            <ChipList
                disabled
                stripPath={false}
                values={['failed to find']}
                maxChips={1}
            />
        );
    }

    if (!entities || entities.length < 1) {
        return (
            <ChipList
                disabled
                stripPath={false}
                values={[entities === null ? 'Loading...' : 'N/A']}
                maxChips={1}
            />
        );
    }

    const entityNameList = entities.map((catalogName) => {
        return {
            display: catalogName,
            link: generatePath({
                catalog_name: catalogName,
            }),
            newWindow: false,
            title: `View details for ${catalogName}`,
        };
    });

    return (
        <ChipList values={entityNameList} maxChips={5} newWindow={newWindow} />
    );
}

export default RelatedEntities;
