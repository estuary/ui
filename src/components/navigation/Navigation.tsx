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
    Popover,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import { useShallow } from 'zustand/react/shallow';

import {
    Building2,
    Check,
    ChevronsLeft,
    Shuffle,
    Ellipsis,
    HelpCircle,
    Home,
    LogOut,
    Moon,
    Settings,
    Sun,
} from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import { HelpMenu } from 'src/components/menus/HelpMenu';
import ListItemLink from 'src/components/navigation/ListItemLink';
import UserAvatar from 'src/components/shared/UserAvatar';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant/Store';

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
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const tenantNames = useEntitiesStore_tenantsWithAdmin();
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );
    const menuOpen = Boolean(menuAnchor);

    const [orgAnchor, setOrgAnchor] = React.useState<HTMLElement | null>(null);
    const orgOpen = Boolean(orgAnchor);

    const [helpAnchor, setHelpAnchor] = React.useState<HTMLElement | null>(
        null
    );

    const openNavigation = () => {
        onNavigationToggle(true);
    };

    const closeNavigation = () => {
        onNavigationToggle(false);
    };

    const tenantLabel = selectedTenant
        ? selectedTenant.replace(/\/$/, '')
        : null;

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
                    justifyContent: 'space-between',
                    overflowX: 'hidden',
                }}
            >
                <List
                    aria-label={intl.formatMessage({
                        id: 'navigation.toggle.ariaLabel',
                    })}
                >
                    <ListItemLink
                        icon={<Home />}
                        title={authenticatedRoutes.home.title}
                        link={authenticatedRoutes.home.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<Shuffle />}
                        title={authenticatedRoutes.dataFlows.title}
                        link={authenticatedRoutes.dataFlows.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<Settings />}
                        title={authenticatedRoutes.admin.title}
                        link={authenticatedRoutes.admin.path}
                        isOpen={open}
                    />
                </List>

                <Box sx={{ pb: 1 }}>
                    <ListItemLink
                        icon={<HelpCircle />}
                        title="helpMenu.tooltip"
                        link={(e: React.MouseEvent<HTMLElement>) =>
                            setHelpAnchor(e.currentTarget)
                        }
                        isOpen={open}
                    />
                    <HelpMenu
                        anchorEl={helpAnchor}
                        onClose={() => setHelpAnchor(null)}
                    />

                    <ListItemLink
                        icon={
                            theme.palette.mode === 'dark' ? <Moon /> : <Sun />
                        }
                        title={
                            theme.palette.mode === 'dark'
                                ? 'modeSwitch.darkLabel'
                                : 'modeSwitch.lightLabel'
                        }
                        link={colorMode.toggleColorMode}
                        isOpen={open}
                    />

                    <ListItemLink
                        icon={
                            <ChevronsLeft
                                style={{
                                    transform: open
                                        ? 'scaleX(1)'
                                        : 'scaleX(-1)',
                                    transition: 'all 50ms ease-in-out',
                                }}
                            />
                        }
                        title="navigation.collapse"
                        link={openNavigation}
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
                                <Ellipsis
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

                            <ListItemButton
                                onClick={(e) => setOrgAnchor(e.currentTarget)}
                                sx={{ mx: 1, my: 0.25 }}
                            >
                                <ListItemIcon>
                                    <Building2 />
                                </ListItemIcon>
                                <ListItemText
                                    primary={tenantLabel}
                                    primaryTypographyProps={{ fontSize: 12 }}
                                />
                            </ListItemButton>

                            <Popover
                                open={orgOpen}
                                anchorEl={orgAnchor}
                                onClose={() => setOrgAnchor(null)}
                                anchorOrigin={{
                                    horizontal: 'left',
                                    vertical: 'top',
                                }}
                                transformOrigin={{
                                    horizontal: 'left',
                                    vertical: 'bottom',
                                }}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            width: 240,
                                            p: 1,
                                            borderRadius: 2,
                                        },
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        px: 1,
                                        pt: 0.5,
                                        pb: 1,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        color: 'text.secondary',
                                    }}
                                >
                                    <FormattedMessage id="tenant.organization" />
                                </Typography>

                                {tenantNames.map((tenant) => {
                                    const label = tenant.replace(/\/$/, '');
                                    const isSelected =
                                        tenant === selectedTenant;

                                    return (
                                        <MenuItem
                                            key={tenant}
                                            selected={isSelected}
                                            onClick={() => {
                                                setSelectedTenant(tenant);
                                                setOrgAnchor(null);
                                            }}
                                            sx={{
                                                borderRadius: 1,
                                                fontSize: 13,
                                                py: 0.75,
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            {label}

                                            {isSelected ? (
                                                <Check
                                                    size={14}
                                                    strokeWidth={2}
                                                />
                                            ) : null}
                                        </MenuItem>
                                    );
                                })}
                            </Popover>
                        </>
                    ) : null}
                </Box>
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
