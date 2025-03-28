import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'src/hooks/searchParams/useLoginRedirectPath';
import { useMemo } from 'react';

// TODO (routes) This is hardcoded because unauthenticated routes is not yet invoked
//   need to move the routes to a single location. Also... just need to make the route
//   settings in all JSON probably.
const redirectToBase = `${window.location.origin}/auth`;

function useRedirectPath(grantToken: string | undefined) {
    const redirectTo = useLoginRedirectPath(redirectToBase);

    return useMemo(
        () =>
            grantToken
                ? `${redirectTo}?${GlobalSearchParams.GRANT_TOKEN}=${grantToken}`
                : redirectTo,
        [grantToken, redirectTo]
    );
}

export default useRedirectPath;
