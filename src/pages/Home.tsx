//TODO (UI / UX) - These icons are not final
import { Collapse, IconButton, Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import Dashboard from 'components/dashboard';
import HeroImageAndDescription from 'components/hero';
import LoginNotifications from 'components/login/Notifications';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePageTitle from 'hooks/usePageTitle';
import { Plus, Xmark } from 'iconoir-react';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    const homePageError = useGlobalSearchParams(
        GlobalSearchParams.HOME_PAGE_ERROR
    );

    const [welcomeShown, setWelcomeShown] = useState(false);

    // home page error related
    const notificationMessage = useMemo(() => {
        if (homePageError) {
            return 'directives.grant.skipped.message';
        }

        return null;
    }, [homePageError]);

    return (
        <>
            {notificationMessage ? (
                <LoginNotifications
                    notificationMessage={notificationMessage}
                    notificationTitle="directives.grant.skipped.title"
                />
            ) : null}

            <Toolbar
                disableGutters
                sx={{
                    justifyContent: welcomeShown ? 'center' : 'flex-start',
                    mb: 3,
                }}
            >
                <Typography variant={welcomeShown ? 'h4' : 'h6'}>
                    <FormattedMessage id="home.main.header" />
                </Typography>

                <IconButton
                    onClick={() => setWelcomeShown(!welcomeShown)}
                    style={{ position: 'absolute', top: 14, right: 0 }}
                >
                    {welcomeShown ? <Xmark /> : <Plus />}
                </IconButton>
            </Toolbar>

            <Collapse in={welcomeShown}>
                <HeroImageAndDescription />
            </Collapse>

            <Dashboard />
        </>
    );
};

export default Home;
