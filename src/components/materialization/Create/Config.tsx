import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import ExistingEntityHydrator from 'components/shared/Entity/ExistingEntityCards/Store/Hydrator';
import PageContainer from 'components/shared/PageContainer';

function MaterializationCreateConfig() {
    const entityType = 'materialization';

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.materializations.create.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
            }}
        >
            <ExistingEntityHydrator>
                <EntityCreateConfig
                    title="browserTitle.materializationCreate"
                    entityType={entityType}
                />
            </ExistingEntityHydrator>
        </PageContainer>
    );
}

export default MaterializationCreateConfig;
