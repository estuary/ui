import { Branch } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import Dashboard from 'src/components/home/dashboard';
import LoginError from 'src/components/home/LoginError';
import Welcome from 'src/components/home/Welcome';
import usePageTitle from 'src/hooks/usePageTitle';

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    return (
        <Branch label="Home">
            <LoginError />
            <Welcome />
            <Dashboard />
        </Branch>
    );
};

export default Home;
