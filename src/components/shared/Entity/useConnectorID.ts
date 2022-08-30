import { authenticatedRoutes } from 'app/Authenticated';
import { useSearchParams } from 'react-router-dom';

function useConnectorID() {
    const [searchParams] = useSearchParams();

    const connectorID =
        searchParams.get(
            authenticatedRoutes.captures.create.params.connectorID
        ) ??
        searchParams.get(
            authenticatedRoutes.materializations.create.params.connectorId
        ) ??
        null;

    return connectorID;
}

export default useConnectorID;
