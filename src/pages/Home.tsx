//TODO (UI / UX) - These icons are not final
import { Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import HeroImageAndDescription from 'components/hero';
import LoginNotifications from 'components/login/Notifications';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePageTitle from 'hooks/usePageTitle';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

const Home = () => {
    usePageTitle({ header: authenticatedRoutes.home.title });

    const homePageError = useGlobalSearchParams(
        GlobalSearchParams.HOME_PAGE_ERROR
    );

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
