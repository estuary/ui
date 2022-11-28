import { Auth } from '@supabase/ui';
import { CliAuthSuccess } from 'components/CliAuthSuccess';
import { Login } from 'pages/Login';
import { authenticatedRoutes } from '../app/routes';

export const CliLogin = () => {
    const { user } = Auth.useUser();

    if (user) {
        return <CliAuthSuccess />;
    } else {
        return (
            <Login redirectTo={authenticatedRoutes.cliAuth.success.fullPath} />
        );
    }
};
