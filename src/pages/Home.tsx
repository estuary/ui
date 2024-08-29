//TODO (UI / UX) - These icons are not final
import {
    Box,
    Collapse,
    IconButton,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import HeroImageAndDescription from 'components/hero';
import Dashboard from 'components/home/dashboard';
import LoginNotifications from 'components/login/Notifications';
import { useShowDashboardWelcome } from 'context/DashboardWelcome';
import { defaultOutline, semiTransparentBackground } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePageTitle from 'hooks/usePageTitle';
import { Plus, Xmark } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

const Home = () => {
    const theme = useTheme();

    usePageTitle({ header: authenticatedRoutes.home.title });
    const homePageError = useGlobalSearchParams(
        GlobalSearchParams.HOME_PAGE_ERROR
    );

    const { welcomeShown, setWelcomeShown } = useShowDashboardWelcome();

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

            <Box
                sx={{
                    background: semiTransparentBackground[theme.palette.mode],
                    border: defaultOutline[theme.palette.mode],
                    borderRadius: 3,
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        justifyContent: welcomeShown ? 'center' : 'flex-start',
                        px: 2,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ fontSize: welcomeShown ? 24 : 18 }}
                    >
                        <FormattedMessage id="home.main.header" />
                    </Typography>

                    <IconButton
                        onClick={() => setWelcomeShown(!welcomeShown)}
                        style={{ position: 'absolute', top: 14, right: 8 }}
                    >
                        {welcomeShown ? (
                            <Xmark
                                style={{ color: theme.palette.text.primary }}
                            />
                        ) : (
                            <Plus
                                style={{ color: theme.palette.text.primary }}
                            />
                        )}
                    </IconButton>
                </Toolbar>

                <Collapse in={welcomeShown}>
                    <HeroImageAndDescription />
                </Collapse>
            </Box>

            <Dashboard />
        </>
    );
};

export default Home;
