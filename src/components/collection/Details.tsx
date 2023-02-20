import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import PageContainer from 'components/shared/PageContainer';
import { EntityContextProvider } from 'context/EntityContext';

function CollectionDetails() {
    return (
        <EntityContextProvider value="collection">
            <PageContainer
                pageTitleProps={{
                    header: authenticatedRoutes.collections.details.title,
                }}
            >
                <EntityDetails />
            </PageContainer>
        </EntityContextProvider>
    );
}

export default CollectionDetails;
