import { authenticatedRoutes } from 'app/routes';
import EntityCreateConfig from 'components/shared/Entity/Create/Config';
import usePageTitle from 'hooks/usePageTitle';

const entityType = 'capture';

export default function CaptureExpressCreateConfig() {
    usePageTitle({
        header: authenticatedRoutes.captures.create.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
    });

    return <EntityCreateConfig condensed entityType={entityType} />;
}
