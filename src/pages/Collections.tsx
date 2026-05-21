import { authenticatedRoutes } from 'src/app/routes';
import CollectionsTable from 'src/components/tables/Collections';
import usePageTitle from 'src/hooks/usePageTitle';

const Collections = () => {
    usePageTitle({
        header: authenticatedRoutes.collections.title,
        headerLink: 'https://docs.estuary.dev/concepts/#collections',
    });

    return <CollectionsTable />;
};

export default Collections;
