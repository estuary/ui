import React from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Popover,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';

import { useShallow } from 'zustand/react/shallow';

import {
    Building,
    Check,
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    FastArrowLeft,
    HalfMoon,
    HelpCircle,
    HomeSimple,
    LogOut,
    Settings,
    SunLight,
} from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import PrefixSelector from 'src/components/inputs/PrefixedName/PrefixSelector';
import { HelpMenu } from 'src/components/menus/HelpMenu';
import ListItemLink from 'src/components/navigation/ListItemLink';
import UserAvatar from 'src/components/shared/UserAvatar';
import { supabaseClient } from 'src/context/GlobalProviders';
import { paperBackground, useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import {
    useEntitiesStore_capabilities_adminable,
    useEntitiesStore_tenantsWithAdmin,
} from 'src/stores/Entities/hooks';
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
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    const tenantNames = useEntitiesStore_tenantsWithAdmin();
    const hasSupportAccess = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );
    const allPrefixes = useEntitiesStore_capabilities_adminable(false);

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );
    const menuOpen = Boolean(menuAnchor);

    const [helpAnchor, setHelpAnchor] = React.useState<HTMLElement | null>(
        null
    );

    const [orgAnchor, setOrgAnchor] = React.useState<HTMLElement | null>(null);
    const orgOpen = Boolean(orgAnchor);

    const [orgDialogOpen, setOrgDialogOpen] = React.useState(false);

    const tenantLabel = selectedTenant
        ? selectedTenant.replace(/\/$/, '')
        : null;

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
                            link={(e: React.MouseEvent<HTMLElement>) =>
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
                                <ListItemButton
                                    onClick={(e) =>
                                        setMenuAnchor(e.currentTarget)
                                    }
                                    sx={{
                                        minHeight: 45,
                                        px: 1.5,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <UserAvatar
                                            userEmail={userDetails.email}
                                            userName={userDetails.userName}
                                            avatarUrl={userDetails.avatar}
                                            size={22}
                                        />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            userDetails.userName ??
                                            userDetails.email
                                        }
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            noWrap: true,
                                        }}
                                        sx={{
                                            display: !open ? 'none' : undefined,
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            colorMode.toggleColorMode();
                                        }}
                                    >
                                        <ListItemIcon>
                                            {theme.palette.mode === 'dark' ? (
                                                <SunLight />
                                            ) : (
                                                <HalfMoon />
                                            )}
                                        </ListItemIcon>
                                        <FormattedMessage
                                            id={
                                                theme.palette.mode === 'dark'
                                                    ? 'modeSwitch.label.light'
                                                    : 'modeSwitch.label.dark'
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

                                <ListItemButton
                                    onClick={(e) =>
                                        hasSupportAccess
                                            ? setOrgDialogOpen(true)
                                            : setOrgAnchor(e.currentTarget)
                                    }
                                    sx={{
                                        minHeight: 45,
                                        px: 1.5,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Building />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={tenantLabel}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            noWrap: true,
                                        }}
                                        sx={{
                                            display: !open ? 'none' : undefined,
                                        }}
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
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                {label}

                                                {isSelected ? <Check /> : null}
                                            </MenuItem>
                                        );
                                    })}
                                </Popover>

                                <Dialog
                                    open={orgDialogOpen}
                                    onClose={() => setOrgDialogOpen(false)}
                                    fullWidth
                                    maxWidth="xs"
                                >
                                    <DialogTitle>
                                        <FormattedMessage id="tenant.organization" />
                                    </DialogTitle>
                                    <DialogContent>
                                        <PrefixSelector
                                            disabled={false}
                                            error={false}
                                            label={intl.formatMessage({
                                                id: 'common.tenant',
                                            })}
                                            labelId="org-switcher"
                                            onChange={(newValue) => {
                                                setSelectedTenant(newValue);
                                                setOrgDialogOpen(false);
                                            }}
                                            options={allPrefixes}
                                            value={selectedTenant}
                                            variantString="outlined"
                                        />
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : null}
                    </List>
                </Box>
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
