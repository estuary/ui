import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import CatalogNameGuard from 'components/shared/guards/CatalogName';
import { EntityContextProvider } from 'context/EntityContext';
import usePageTitle from 'hooks/usePageTitle';

function MaterializationDetails() {
    usePageTitle({
        header: authenticatedRoutes.materializations.details.title,
    });
    return (
        <EntityContextProvider value="materialization">
            <CatalogNameGuard>
                <EntityDetails />
            </CatalogNameGuard>
        </EntityContextProvider>
    );
}

export default MaterializationDetails;
