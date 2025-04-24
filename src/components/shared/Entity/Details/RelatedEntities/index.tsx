import type { RelatedEntitiesProps } from 'src/components/shared/Entity/Details/RelatedEntities/types';

import { useMemo } from 'react';

import { Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { useLiveSpecs_parentCapture } from 'src/hooks/useLiveSpecs';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function RelatedEntities({
    collectionId,
    entityType,
    newWindow,
    preferredList,
}: RelatedEntitiesProps) {
    const intl = useIntl();

    const { generatePath } = useDetailsNavigator(
        ENTITY_SETTINGS[entityType].routes.details
    );

    const { data, error, isValidating } = useLiveSpecs_parentCapture(
        collectionId ?? null,
        entityType
    );

    console.log('{ data, error, isValidating }', { data, error, isValidating });

    const dataToShow = useMemo(() => {
        if (preferredList) {
            return preferredList;
        } else {
            return data?.map((datum) => datum.live_specs.catalog_name);
        }
    }, [data, preferredList]);

    if (isValidating) {
        return <Skeleton />;
    }

    if (error) {
        return (
            <ChipList
                disabled
                stripPath={false}
                values={[
                    intl.formatMessage({
                        id: 'detailsPanel.details.relatedEntity.failed',
                    }),
                ]}
                maxChips={1}
            />
        );
    }

    if (!dataToShow || dataToShow.length < 1) {
        return (
            <ChipList
                disabled
                stripPath={false}
                values={[intl.formatMessage({ id: 'common.missing' })]}
                maxChips={1}
            />
        );
    }

    const entityNameList = dataToShow.map((catalogName) => {
        return {
            display: catalogName,
            link: generatePath({
                catalog_name: catalogName,
            }),
            newWindow: false,
            title: intl.formatMessage(
                {
                    id: 'detailsPanel.details.relatedEntity.link',
                },
                {
                    catalogName,
                }
            ),
        };
    });

    return (
        <ChipList values={entityNameList} maxChips={5} newWindow={newWindow} />
    );
}

export default RelatedEntities;
