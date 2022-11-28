import { Login } from 'pages/Login';

import FullPageSpinner from 'components/fullPage/Spinner';
import * as React from 'react';
import { unauthenticatedRoutes } from '../../app/routes';

export const CliLogin = () => {
    // The origin will likely end with a '/', which can result in doubled '/'
    // characters, which doesn't work with magicLink redirects. So this ensures
    // that `redirectTo` is always a well-formed absolute URL.
    let redirectTo = window.location.origin;
    if (redirectTo.substr(-1) === '/') {
        // fullPath always starts with a '/'
        redirectTo =
            redirectTo +
            unauthenticatedRoutes.cliAuth.success.fullPath.substr(1);
    } else {
        redirectTo =
            redirectTo + unauthenticatedRoutes.cliAuth.success.fullPath;
    }

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            <Login redirectTo={redirectTo} />
        </React.Suspense>
    );
};
