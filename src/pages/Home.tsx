//TODO (UI / UX) - These icons are not final
import { authenticatedRoutes } from 'app/routes';
import Dashboard from 'components/home/dashboard';
import LoginError from 'components/home/LoginError';
import Welcome from 'components/home/Welcome';
import usePageTitle from 'hooks/usePageTitle';

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
