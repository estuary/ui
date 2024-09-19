import { authenticatedRoutes } from 'app/routes';
import ChipList from 'components/shared/ChipList';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useIntl } from 'react-intl';

interface Props {
    collections: string[] | null;
    newWindow?: boolean;
}

function RelatedCollections({ collections, newWindow }: Props) {
    const intl = useIntl();

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.collections.details.overview.fullPath
    );

    if (!collections) {
        return null;
    }

    const collectionList = collections.map((collection: string) => {
        return {
            display: collection,
            link: generatePath({
                catalog_name: collection,
            }),
            newWindow,
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
