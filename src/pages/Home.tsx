//TODO (UI / UX) - These icons are not final

import { authenticatedRoutes } from 'src/app/routes';
import Dashboard from 'src/components/home/dashboard';
import LoginError from 'src/components/home/LoginError';
import Welcome from 'src/components/home/Welcome';
import usePageTitle from 'src/hooks/usePageTitle';

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    return (
        <>
            <LoginError />

            <Welcome />

            <Dashboard />
        </>
    );
};

export default Home;
