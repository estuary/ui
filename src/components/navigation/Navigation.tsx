import { useState } from 'react';

import { Box, List, Stack, Toolbar, useTheme } from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import { useShallow } from 'zustand/react/shallow';

import {
    Building,
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    FastArrowLeft,
    HelpCircle,
    HomeSimple,
    Settings,
} from 'iconoir-react';
import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import { HelpMenu } from 'src/components/menus/HelpMenu';
import { OrgMenu } from 'src/components/menus/OrgMenu';
import { UserMenu } from 'src/components/menus/UserMenu';
import { ListItemLink } from 'src/components/navigation/ListItemLink';
import UserAvatar from 'src/components/shared/UserAvatar';
import { paperBackground } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useTenantStore } from 'src/stores/Tenant';

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const Navigation = ({ open, width, onNavigationToggle }: NavigationProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const userDetails = useUserStore(useShallow((state) => state.userDetails));
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);
    const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
    const [orgAnchor, setOrgAnchor] = useState<HTMLElement | null>(null);

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
                    transition: (paperTheme) =>
                        `${paperTheme.transitions.duration.shortest}ms`,
                    width,
                    border: 0,
                    background: paperBackground[theme.palette.mode],
                },
                transition: (drawerTheme) =>
                    `${drawerTheme.transitions.duration.shortest}ms`,
                width,
            }}
        >
            <Toolbar />

            <Stack
                sx={{
                    height: '100%',
                    justifyContent: 'space-between',
                    overflowX: 'hidden',
                }}
            >
                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            isOpen={open}
                            icon={<HomeSimple />}
                            title={intl.formatMessage({
                                id: authenticatedRoutes.home.title,
                            })}
                            to={authenticatedRoutes.home.path}
                        />
                        <ListItemLink
                            isOpen={open}
                            icon={<CloudUpload />}
                            title={intl.formatMessage({
                                id: authenticatedRoutes.captures.title,
                            })}
                            to={authenticatedRoutes.captures.path}
                        />
                        <ListItemLink
                            isOpen={open}
                            icon={<DatabaseScript />}
                            title={intl.formatMessage({
                                id: authenticatedRoutes.collections.title,
                            })}
                            to={authenticatedRoutes.collections.path}
                        />
                        <ListItemLink
                            isOpen={open}
                            icon={<CloudDownload />}
                            title={intl.formatMessage({
                                id: authenticatedRoutes.materializations.title,
                            })}
                            to={authenticatedRoutes.materializations.path}
                        />
                        <ListItemLink
                            isOpen={open}
                            icon={<Settings />}
                            title={intl.formatMessage({
                                id: authenticatedRoutes.admin.title,
                            })}
                            to={authenticatedRoutes.admin.path}
                        />
                    </List>
                </Box>

                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.ariaLabel.secondary',
                        })}
                    >
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
                            title={intl.formatMessage({
                                id: 'navigation.collapse',
                            })}
                            tooltip={intl.formatMessage({
                                id: 'navigation.tooltip.expand',
                            })}
                            onClick={openNavigation}
                            isOpen={open}
                        />
                        <ListItemLink
                            icon={<HelpCircle />}
                            title={intl.formatMessage({
                                id: 'helpMenu.tooltip',
                            })}
                            onClick={(e) => setHelpAnchor(e.currentTarget)}
                            isOpen={open}
                        />
                        <HelpMenu
                            anchorEl={helpAnchor}
                            onClose={() => setHelpAnchor(null)}
                        />

                        {userDetails ? (
                            <>
                                <ListItemLink
                                    icon={
                                        <UserAvatar
                                            userEmail={userDetails.email}
                                            userName={userDetails.userName}
                                            avatarUrl={userDetails.avatar}
                                            size={22}
                                        />
                                    }
                                    title={
                                        userDetails.userName ??
                                        userDetails.email
                                    }
                                    onClick={(e) =>
                                        setUserAnchor(e.currentTarget)
                                    }
                                    isOpen={open}
                                />
                                <UserMenu
                                    anchorEl={userAnchor}
                                    onClose={() => setUserAnchor(null)}
                                />

                                <ListItemLink
                                    icon={<Building />}
                                    title={
                                        selectedTenant
                                            ? selectedTenant.replace(/\/$/, '')
                                            : ''
                                    }
                                    onClick={(e) =>
                                        setOrgAnchor(e.currentTarget)
                                    }
                                    isOpen={open}
                                />
                                <OrgMenu
                                    anchorEl={orgAnchor}
                                    onClose={() => setOrgAnchor(null)}
                                />
                            </>
                        ) : null}
                    </List>
                </Box>
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
