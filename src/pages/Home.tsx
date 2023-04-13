//TODO (UI / UX) - These icons are not final
import { Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import HeroImageAndDescription from 'components/hero';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    return (
        <>
            <Toolbar sx={{ justifyContent: 'center', mb: 3 }}>
                <Typography variant="h4">
                    <FormattedMessage id="home.main.header" />
                </Typography>
            </Toolbar>

            <HeroImageAndDescription />
        </>
    );
};

export default Home;
