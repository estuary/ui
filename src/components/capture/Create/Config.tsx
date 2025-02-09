import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import usePageTitle from 'hooks/usePageTitle';

const entityType = 'capture';

function CaptureCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.captures.create.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
    });

    return <EntityCreateConfig entityType={entityType} />;
}

export default CaptureCreateConfig;
