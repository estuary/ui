import { authenticatedRoutes, REDIRECT_TO_PARAM_NAME } from 'app/routes';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// If no redirectToBase is passed in then we assume you want to get redirected to the home page
function useLoginRedirectPath(redirectToBase?: string) {
    const location = useLocation();
    const from = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search}`
        : authenticatedRoutes.home.path;

    const redirectTo = useMemo(
        () =>
            redirectToBase
                ? `${redirectToBase}?${REDIRECT_TO_PARAM_NAME}=${encodeURIComponent(
                      from
                  )}`
                : from,
        [from, redirectToBase]
    );

    return redirectTo;
}

export default useLoginRedirectPath;
