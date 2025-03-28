import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { Navigate, useLocation } from 'react-router-dom';
import { getPathWithParams } from 'src/utils/misc-utils';

function GoogleMarketplaceCallback() {
    const location = useLocation();

    return (
        <Navigate
            to={getPathWithParams(unauthenticatedRoutes.logout.path, {
                [GlobalSearchParams.PROVIDER]: 'google',
            })}
            state={{
                from: {
                    ...location,
                    pathname: authenticatedRoutes.home.path,
                },
            }}
            replace
        />
    );
}

export default GoogleMarketplaceCallback;
