import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { Navigate, useLocation } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';

function GoogleMarketplaceCallback() {
    const location = useLocation();

    return (
        <Navigate
            to={getPathWithParams(unauthenticatedRoutes.login.path, {
                [GlobalSearchParams.PROVIDER]: 'google',
            })}
            state={{
                from: {
                    ...location,
                    pathname: authenticatedRoutes.marketplace.verify.fullPath,
                },
            }}
            replace
        />
    );
}

export default GoogleMarketplaceCallback;
