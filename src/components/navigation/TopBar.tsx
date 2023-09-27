import { Divider, Stack, Toolbar, Typography } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import { authenticatedRoutes } from 'app/routes';
import CompanyLogo from 'components/graphics/CompanyLogo';
import HelpMenu from 'components/menus/HelpMenu';
import UserMenu from 'components/menus/UserMenu';
import PageTitle from 'components/navigation/PageTitle';
import SidePanelDocsOpenButton from 'components/sidePanelDocs/OpenButton';
import { zIndexIncrement } from 'context/Theme';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';

const Topbar = () => {
    const theme = useTheme();

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    useEffect(() => {
        showNotification({
            description: (
                <Typography>
                    To provide payment details,{' '}
                    <NavLink to={authenticatedRoutes.admin.billing.fullPath}>
                        click here
                    </NavLink>
                    .
                </Typography>
            ),
            severity: 'error',
            title: (
                <Typography>
                    Your tenant has exceeded free tier usage limit
                </Typography>
            ),
            options: {
                persist: true,
            },
        });
    });

    return (
        <MuiAppBar
            sx={{
                position: 'fixed',
                zIndex: theme.zIndex.drawer + zIndexIncrement,
                boxShadow:
                    'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
            }}
        >
            <Toolbar
                sx={{
                    px: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ alignItems: 'center' }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <CompanyLogo />

                    <PageTitle />
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <HelpMenu />

                    <UserMenu iconColor={theme.palette.text.primary} />

                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
