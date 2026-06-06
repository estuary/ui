import type { MouseEvent } from 'react';

import { useState } from 'react';

import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    useTheme,
} from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import { useShallow } from 'zustand/react/shallow';

import {
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
import OrgMenu from 'src/components/menus/OrgMenu';
import UserMenu from 'src/components/menus/UserMenu';
import ListItemLink from 'src/components/navigation/ListItemLink';
import { paperBackground } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const Navigation = ({ open, width, onNavigationToggle }: NavigationProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const userDetails = useUserStore(useShallow((state) => state.userDetails));

    const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);

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
                            icon={<HomeSimple />}
                            title={authenticatedRoutes.home.title}
                            link={authenticatedRoutes.home.path}
                        />
                        <ListItemLink
                            icon={<CloudUpload />}
                            title={authenticatedRoutes.captures.title}
                            link={authenticatedRoutes.captures.path}
                        />
                        <ListItemLink
                            icon={<DatabaseScript />}
                            title={authenticatedRoutes.collections.title}
                            link={authenticatedRoutes.collections.path}
                        />
                        <ListItemLink
                            icon={<CloudDownload />}
                            title={authenticatedRoutes.materializations.title}
                            link={authenticatedRoutes.materializations.path}
                        />
                        <ListItemLink
                            icon={<Settings />}
                            title={authenticatedRoutes.admin.title}
                            link={authenticatedRoutes.admin.path}
                        />
                    </List>
                </Box>

                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.ariaLabel',
                        })}
                        sx={{
                            py: 1,
                        }}
                    >
                        <Tooltip
                            title={
                                !open
                                    ? intl.formatMessage({
                                          id: 'navigation.tooltip.expand',
                                      })
                                    : null
                            }
                            placement="right-end"
                            enterDelay={open ? 1000 : undefined}
                        >
                            <ListItemButton
                                component="a"
                                onClick={openNavigation}
                                sx={{
                                    minHeight: 45,
                                    px: 1.5,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <FastArrowLeft
                                        style={{
                                            transform: open
                                                ? 'scaleX(1)'
                                                : 'scaleX(-1)',
                                            transition: 'all 50ms ease-in-out',
                                        }}
                                    />
                                </ListItemIcon>

                                <ListItemText
                                    primary={intl.formatMessage({
                                        id: 'navigation.collapse',
                                    })}
                                    sx={{
                                        display: !open ? 'none' : undefined,
                                    }}
                                />
                            </ListItemButton>
                        </Tooltip>
                        <ListItemLink
                            icon={<HelpCircle />}
                            title="helpMenu.tooltip"
                            link={(e: MouseEvent<HTMLElement>) =>
                                setHelpAnchor(e.currentTarget)
                            }
                            isOpen={open}
                        />
                        <HelpMenu
                            anchorEl={helpAnchor}
                            onClose={() => setHelpAnchor(null)}
                        />

                        {userDetails ? (
                            <>
                                <UserMenu open={open} />

                                <OrgMenu open={open} />
                            </>
                        ) : null}
                    </List>
                </Box>
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
