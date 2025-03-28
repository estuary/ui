import { authenticatedRoutes } from 'src/app/routes';
import EntityCreateConfig from 'src/components/shared/Entity/Create/Config';
import usePageTitle from 'src/hooks/usePageTitle';

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
