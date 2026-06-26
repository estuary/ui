import React from 'react';

import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import { useShallow } from 'zustand/react/shallow';

import {
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    FastArrowLeft,
    HalfMoon,
    HelpCircle,
    HomeSimple,
    LogOut,
    MoreHoriz,
    Settings,
    SunLight,
} from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import { HeaderPill } from 'src/components/AgentSkills/HeaderPill';
import { HelpMenu } from 'src/components/menus/HelpMenu';
import ListItemLink from 'src/components/navigation/ListItemLink';
import UserAvatar from 'src/components/shared/UserAvatar';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const Navigation = ({ open, width, onNavigationToggle }: NavigationProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const colorMode = useColorMode();

    const userDetails = useUserStore(useShallow((state) => state.userDetails));

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );
    const menuOpen = Boolean(menuAnchor);

    const [helpAnchor, setHelpAnchor] = React.useState<HTMLElement | null>(
        null
    );

    const openNavigation = () => {
        onNavigationToggle(true);
    };

    const closeNavigation = () => {
        onNavigationToggle(false);
    };

    return (
        <MuiDrawer
            anchor="left"
            open={open}
            variant="permanent"
            ModalProps={{ keepMounted: true }}
            onClose={closeNavigation}
            sx={{
                [`& .${drawerClasses.paper}`]: {
                    boxSizing: 'border-box',
                    position: 'static',
                    height: '100%',
                    transition: (paperTheme) =>
                        `${paperTheme.transitions.duration.shortest}ms`,
                    width,
                },
                transition: (drawerTheme) =>
                    `${drawerTheme.transitions.duration.shortest}ms`,
                width,
            }}
        >
            <Stack
                sx={{
                    height: '100%',
                    overflowX: 'hidden',
                }}
            >
                <List
                    aria-label={intl.formatMessage({
                        id: 'navigation.toggle.ariaLabel',
                    })}
                >
                    <ListItemLink
                        icon={<HomeSimple />}
                        title={authenticatedRoutes.home.title}
                        link={authenticatedRoutes.home.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<CloudUpload />}
                        title={authenticatedRoutes.captures.title}
                        link={authenticatedRoutes.captures.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<DatabaseScript />}
                        title={authenticatedRoutes.collections.title}
                        link={authenticatedRoutes.collections.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<CloudDownload />}
                        title={authenticatedRoutes.materializations.title}
                        link={authenticatedRoutes.materializations.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<Settings />}
                        title={authenticatedRoutes.admin.title}
                        link={authenticatedRoutes.admin.path}
                        isOpen={open}
                    />
                </List>

                <Box sx={{ mt: 'auto', pb: 1 }}>
                    <Box
                        sx={{
                            px: 1,
                            py: 1,
                            display: 'flex',
                            justifyContent: open ? 'flex-start' : 'center',
                        }}
                    >
                        <HeaderPill isOpen={open} />
                    </Box>

                    <ListItemLink
                        icon={<HelpCircle />}
                        title="helpMenu.tooltip"
                        onClick={(e) => setHelpAnchor(e.currentTarget)}
                        isOpen={open}
                    />
                    <HelpMenu
                        anchorEl={helpAnchor}
                        onClose={() => setHelpAnchor(null)}
                    />

                    <ListItemLink
                        icon={
                            <FastArrowLeft
                                style={{
                                    transform: open
                                        ? 'scaleX(1)'
                                        : 'scaleX(-1)',
                                    transition: 'all 50ms ease-in-out',
                                }}
                            />
                        }
                        title="navigation.collapse"
                        onClick={openNavigation}
                        isOpen={open}
                    />

                    {userDetails ? (
                        <>
                            <ListItemButton
                                onClick={(e) => setMenuAnchor(e.currentTarget)}
                                sx={{ mx: 1, my: 0.25 }}
                            >
                                <UserAvatar
                                    userEmail={userDetails.email}
                                    userName={userDetails.userName}
                                    avatarUrl={userDetails.avatar}
                                    size={20}
                                />
                                <ListItemText
                                    primary={userDetails.email}
                                    primaryTypographyProps={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        lineHeight: 1.3,
                                        noWrap: true,
                                    }}
                                />
                                <MoreHoriz
                                    style={{
                                        flexShrink: 0,
                                        color: theme.palette.text.secondary,
                                    }}
                                />
                            </ListItemButton>

                            <Menu
                                anchorEl={menuAnchor}
                                open={menuOpen}
                                onClose={() => setMenuAnchor(null)}
                                onClick={() => setMenuAnchor(null)}
                                anchorOrigin={{
                                    horizontal: 'left',
                                    vertical: 'top',
                                }}
                                transformOrigin={{
                                    horizontal: 'left',
                                    vertical: 'bottom',
                                }}
                            >
                                <MenuItem
                                    disabled
                                    sx={{ opacity: '1 !important' }}
                                >
                                    <Stack spacing={0}>
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {userDetails.userName ??
                                                userDetails.email}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {userDetails.email}
                                        </Typography>
                                    </Stack>
                                </MenuItem>

                                <Divider />

                                <MenuItem
                                    onClick={() => colorMode.toggleColorMode()}
                                >
                                    <ListItemIcon>
                                        {theme.palette.mode === 'dark' ? (
                                            <HalfMoon />
                                        ) : (
                                            <SunLight />
                                        )}
                                    </ListItemIcon>
                                    <FormattedMessage
                                        id={
                                            theme.palette.mode === 'dark'
                                                ? 'modeSwitch.darkLabel'
                                                : 'modeSwitch.lightLabel'
                                        }
                                    />
                                </MenuItem>
                                <Divider />

                                <MenuItem
                                    onClick={() => {
                                        void supabaseClient.auth.signOut();
                                    }}
                                >
                                    <ListItemIcon>
                                        <LogOut />
                                    </ListItemIcon>
                                    <FormattedMessage id="cta.logout" />
                                </MenuItem>
                            </Menu>
                        </>
                    ) : null}
                </Box>
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
