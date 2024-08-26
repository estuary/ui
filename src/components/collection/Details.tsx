import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import CatalogNameGuard from 'components/shared/guards/CatalogName';
import { EntityContextProvider } from 'context/EntityContext';
import usePageTitle from 'hooks/usePageTitle';

function CollectionDetails() {
    usePageTitle({
        header: authenticatedRoutes.collections.details.title,
    });
    return (
        <EntityContextProvider value="collection">
            <CatalogNameGuard>
                <EntityDetails />
            </CatalogNameGuard>
        </EntityContextProvider>
    );
}

export default CollectionDetails;
