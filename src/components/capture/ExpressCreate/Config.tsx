import { authenticatedRoutes } from 'src/app/routes';
import EntityCreateConfig from 'src/components/shared/Entity/Create/Config';
import usePageTitle from 'src/hooks/usePageTitle';

const entityType = 'capture';

export default function ExpressCaptureCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.express.captureCreate.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
    });

    return <EntityCreateConfig condensed entityType={entityType} />;
}
