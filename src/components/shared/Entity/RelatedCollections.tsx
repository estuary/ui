import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'app/routes';

import ChipList from 'components/shared/ChipList';

import useDetailsNavigator from 'hooks/useDetailsNavigator';

interface Props {
    collections: string[];
}

function RelatedCollections({ collections }: Props) {
    const intl = useIntl();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );

    const collectionList = collections.map((collection: string) => {
        return {
            display: collection,
            link: generatePath({
                catalog_name: collection,
                last_pub_id: '',
            }),
            title: intl.formatMessage(
                {
                    id: 'detailsPanel.details.linkToCollection',
                },
                {
                    catalogName: collection,
                }
            ),
        };
    });

    return <ChipList values={collectionList} maxChips={5} />;
}

export default RelatedCollections;
