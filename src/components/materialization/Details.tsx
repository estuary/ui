import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import PageContainer from 'components/shared/PageContainer';
import { EntityContextProvider } from 'context/EntityContext';

function MaterializationDetails() {
    return (
        <EntityContextProvider value="materialization">
            <PageContainer
                pageTitleProps={{
                    header: authenticatedRoutes.materializations.details.title,
                }}
            >
                <EntityDetails />
            </PageContainer>
        </EntityContextProvider>
    );
}

export default MaterializationDetails;
