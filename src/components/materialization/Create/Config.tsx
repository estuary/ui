import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import usePageTitle from 'hooks/usePageTitle';

const entityType = 'materialization';

function MaterializationCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.materializations.create.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
    });

    return <EntityCreateConfig entityType={entityType} />;
}

export default MaterializationCreateConfig;
