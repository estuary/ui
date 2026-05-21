import React from 'react';

import {
    Box,
    Divider,
    List,
    Menu,
    MenuItem,
    Popover,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import {
    Building2,
    Check,
    ChevronsLeft,
    CloudDownload,
    CloudUpload,
    Database,
    Ellipsis,
    Home,
    LogOut,
    Moon,
    Settings,
    Sun,
} from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useShallow } from 'zustand/react/shallow';

import { authenticatedRoutes } from 'src/app/routes';
import ListItemLink from 'src/components/navigation/ListItemLink';
import UserAvatar from 'src/components/shared/UserAvatar';
import { useColorMode } from 'src/context/Theme';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant/Store';

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const ICON_SIZE = 18;
const ICON_STROKE = 1.5;

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

    const [menuAnchor, setMenuAnchor] =
        React.useState<HTMLElement | null>(null);
    const menuOpen = Boolean(menuAnchor);

    const [orgAnchor, setOrgAnchor] =
        React.useState<HTMLElement | null>(null);
    const orgOpen = Boolean(orgAnchor);

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
                    border: 0,
                    background:theme.palette.background.default
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
                        icon={<Home size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        title={authenticatedRoutes.home.title}
                        link={authenticatedRoutes.home.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<CloudUpload size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        title={authenticatedRoutes.captures.title}
                        link={authenticatedRoutes.captures.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<Database size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        title={authenticatedRoutes.collections.title}
                        link={authenticatedRoutes.collections.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<CloudDownload size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        title={authenticatedRoutes.materializations.title}
                        link={authenticatedRoutes.materializations.path}
                        isOpen={open}
                    />
                    <ListItemLink
                        icon={<Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        title={authenticatedRoutes.admin.title}
                        link={authenticatedRoutes.admin.path}
                        isOpen={open}
                    />
                </List>

                <Box sx={{ pb: 1 }}>
                    <Tooltip
                        title={intl.formatMessage({
                            id: theme.palette.mode === 'dark' ? 'modeSwitch.darkLabel' : 'modeSwitch.lightLabel',
                        })}
                        placement="right-end"
                        enterDelay={open ? 1000 : undefined}
                    >
                        <Box
                            onClick={colorMode.toggleColorMode}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.25,
                                py: 1,
                                mx: 1,
                                my: 0.25,
                                borderRadius: 1.5,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            {theme.palette.mode === 'dark' ? (
                                <Moon
                                    size={ICON_SIZE}
                                    strokeWidth={ICON_STROKE}
                                    style={{ flexShrink: 0 }}
                                />
                            ) : (
                                <Sun
                                    size={ICON_SIZE}
                                    strokeWidth={ICON_STROKE}
                                    style={{ flexShrink: 0 }}
                                />
                            )}

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {intl.formatMessage({
                                    id: theme.palette.mode === 'dark' ? 'modeSwitch.darkLabel' : 'modeSwitch.lightLabel',
                                })}
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip
                        title={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                        placement="right-end"
                        enterDelay={open ? 1000 : undefined}
                    >
                        <Box
                            onClick={openNavigation}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.25,
                                py: 1,
                                mx: 1,
                                my: 0.25,
                                borderRadius: 1.5,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            <ChevronsLeft
                                size={ICON_SIZE}
                                strokeWidth={ICON_STROKE}
                                style={{
                                    flexShrink: 0,
                                    transform: open
                                        ? 'scaleX(1)'
                                        : 'scaleX(-1)',
                                    transition: 'all 50ms ease-in-out',
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {intl.formatMessage({
                                    id: 'navigation.collapse',
                                })}
                            </Typography>
                        </Box>
                    </Tooltip>

                    {userDetails ? (
                        <>
                        <Box
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                py: 1,
                                px: 1.25,
                                mx: 1,
                                my: 0.25,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                            >
                                <UserAvatar
                                    userEmail={userDetails.email}
                                    userName={userDetails.userName}
                                    avatarUrl={userDetails.avatar}
                                    size={20}
                                />

                                {open ? (
                                    <>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {userDetails.email}
                                            </Typography>
                                        </Box>

                                        <Ellipsis
                                            size={16}
                                            style={{
                                                flexShrink: 0,
                                                color: theme.palette.text
                                                    .secondary,
                                            }}
                                        />
                                    </>
                                ) : null}
                            </Box>

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
                                <MenuItem disabled sx={{ opacity: '1 !important' }}>
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            mr: 1.5,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <LogOut size={16} strokeWidth={ICON_STROKE} />
                                    </Box>
                                    <FormattedMessage id="cta.logout" />
                                </MenuItem>
                            </Menu>

                        <Box
                            onClick={(e) => setOrgAnchor(e.currentTarget)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                py: 1,
                                px: 1.25,
                                mx: 1,
                                my: 0.25,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            <Building2
                                size={ICON_SIZE}
                                strokeWidth={ICON_STROKE}
                                style={{ flexShrink: 0 }}
                            />

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {tenantLabel}
                            </Typography>
                        </Box>

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
                                            justifyContent:
                                                'space-between',
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
