import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import ExistingEntityHydrator from 'components/shared/Entity/ExistingEntityCards/Store/Hydrator';
import PageContainer from 'components/shared/PageContainer';

function CaptureCreateConfig() {
    const entityType = 'capture';

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.captures.create.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
            }}
        >
            <ExistingEntityHydrator>
                <EntityCreateConfig
                    title="browserTitle.captureCreate"
                    entityType={entityType}
                />
            </ExistingEntityHydrator>
        </PageContainer>
    );
}

export default CaptureCreateConfig;
