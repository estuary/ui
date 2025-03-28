import { authenticatedRoutes } from 'src/app/routes';
import EntityDetails from 'src/components/shared/Entity/Details';
import CatalogNameGuard from 'src/components/shared/guards/CatalogName';
import { EntityContextProvider } from 'src/context/EntityContext';
import usePageTitle from 'src/hooks/usePageTitle';

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
