import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import { EntityContextProvider } from 'context/EntityContext';
import usePageTitle from 'hooks/usePageTitle';

function MaterializationDetails() {
    usePageTitle({
        header: authenticatedRoutes.materializations.details.title,
    });
    return (
        <EntityContextProvider value="materialization">
            <EntityDetails />
        </EntityContextProvider>
    );
}

export default MaterializationDetails;
