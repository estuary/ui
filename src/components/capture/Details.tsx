import { authenticatedRoutes } from 'app/routes';
import EntityDetails from 'components/shared/Entity/Details';
import PageContainer from 'components/shared/PageContainer';
import { EntityContextProvider } from 'context/EntityContext';

function CaptureDetails() {
    return (
        <EntityContextProvider value="capture">
            <PageContainer
                pageTitleProps={{
                    header: authenticatedRoutes.captures.details.title,
                }}
            >
                <EntityDetails />
            </PageContainer>
        </EntityContextProvider>
    );
}

export default CaptureDetails;
