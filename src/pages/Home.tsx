//TODO (UI / UX) - These icons are not final
import { Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import HeroImageAndDescription from 'components/hero';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const Home = () => {
    useBrowserTitle('browserTitle.home');

    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.home.title }}
        >
            <Toolbar sx={{ justifyContent: 'center', mb: 3 }}>
                <Typography variant="h4">
                    <FormattedMessage id="home.main.header" />
                </Typography>
            </Toolbar>

            <HeroImageAndDescription />
        </PageContainer>
    );
};

export default Home;
