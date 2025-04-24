import type { RelatedEntitiesProps } from 'src/components/shared/Entity/Details/RelatedEntities/types';

import { Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { useLiveSpecs_parentCapture } from 'src/hooks/useLiveSpecs';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function RelatedEntities({ collectionId, entityType }: RelatedEntitiesProps) {
    const intl = useIntl();

    const { data, isValidating } = useLiveSpecs_parentCapture(
        collectionId ?? null,
        entityType
    );

    const { generatePath } = useDetailsNavigator(
        ENTITY_SETTINGS[entityType].routes.details
    );

    if (isValidating) {
        return <Skeleton />;
    }

    if (!data || data.length < 1) {
        return null;
    }

    const collectionList = data.map((datum) => {
        const catalogName = datum.live_specs.catalog_name;
        return {
            display: catalogName,
            link: generatePath({
                catalog_name: catalogName,
            }),
            newWindow: false,
            title: intl.formatMessage(
                {
                    id: 'detailsPanel.details.linkToEntity',
                },
                {
                    catalogName,
                }
            ),
        };
    });

    return <ChipList values={collectionList} maxChips={5} />;
}

export default RelatedEntities;
