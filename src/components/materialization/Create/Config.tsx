import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import ExistingEntityHydrator from 'components/shared/Entity/ExistingEntityCards/Store/Hydrator';
import usePageTitle from 'hooks/usePageTitle';

const entityType = 'materialization';

function MaterializationCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.materializations.create.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
    });

    return (
        <ExistingEntityHydrator>
            <EntityCreateConfig
                title="browserTitle.materializationCreate"
                entityType={entityType}
            />
        </ExistingEntityHydrator>
    );
}

export default MaterializationCreateConfig;
