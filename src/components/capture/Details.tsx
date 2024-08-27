import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import CatalogNameGuard from 'components/shared/guards/CatalogName';
import { EntityContextProvider } from 'context/EntityContext';
import usePageTitle from 'hooks/usePageTitle';

function CaptureDetails() {
    usePageTitle({
        header: authenticatedRoutes.captures.details.title,
    });

    return (
        <EntityContextProvider value="capture">
            <CatalogNameGuard>
                <EntityDetails />
            </CatalogNameGuard>
        </EntityContextProvider>
    );
}

export default CaptureDetails;
