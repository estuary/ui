import { Auth } from '@supabase/ui';
import { CliAuthSuccess } from 'components/CliAuthSuccess';
import { Login } from 'pages/Login';

import FullPageSpinner from 'components/fullPage/Spinner';
import * as React from 'react';
import { authenticatedRoutes } from '../app/routes';

export const CliLogin = () => {
    const { user } = Auth.useUser();

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? (
                <CliAuthSuccess />
            ) : (
                <Login
                    redirectTo={authenticatedRoutes.cliAuth.success.fullPath}
                />
            )}
        </React.Suspense>
    );
};
