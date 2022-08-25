import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CableIcon from '@mui/icons-material/Cable';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
//TODO (UI / UX) - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

import StorageIcon from '@mui/icons-material/Storage';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SxProps,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { authenticatedRoutes } from 'app/Authenticated';
import HelpMenu from 'components/menus/HelpMenu';
import UserMenu from 'components/menus/UserMenu';
import ModeSwitch from 'components/navigation/ModeSwitch';
import { darkGlassBkgWithBlur, lightGlassBkgWithBlur } from 'context/Theme';
import { FormattedMessage, useIntl } from 'react-intl';
import ListItemLink from './ListItemLink';

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const Navigation = ({ open, width, onNavigationToggle }: NavigationProps) => {
    const intl = useIntl();

    const theme = useTheme();
    const iconSx: SxProps<Theme> = {
        color: theme.palette.text.primary,
    };

    const openNavigation = () => {
        onNavigationToggle(true);
    };

    const closeNavigation = () => {
        onNavigationToggle(false);
    };

    const paperBackground =
        theme.palette.mode === 'dark'
            ? darkGlassBkgWithBlur
            : lightGlassBkgWithBlur;

    return (
        <MuiDrawer
            anchor="left"
            open={open}
            variant="permanent"
            ModalProps={{ keepMounted: true }}
            onClose={closeNavigation}
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    transition: (paperTheme) =>
                        `${paperTheme.transitions.duration.shortest}ms`,
                    width,
                    borderRadius: '0px 10px 10px 0px',
                    ...paperBackground,
                },
                'transition': (drawerTheme) =>
                    `${drawerTheme.transitions.duration.shortest}ms`,
                width,
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflowX: 'hidden',
                }}
            >
                <Box>
                    <Box
                        sx={{
                            pt: 1,
                            pb: 0.25,
                            pl: '7px',
                            display: 'flex',
                            flexGrow: 1,
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            sx={{ width: 136, ml: '22px', flexShrink: 0 }}
                        >
                            <FormattedMessage id="company" />
                        </Typography>
                    </Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            icon={<InputIcon sx={iconSx} />}
                            title={authenticatedRoutes.captures.title}
                            link={authenticatedRoutes.captures.path}
                        />
                        <ListItemLink
                            icon={<FormatListNumberedIcon sx={iconSx} />}
                            title={authenticatedRoutes.collections.title}
                            link={authenticatedRoutes.collections.path}
                        />
                        <ListItemLink
                            icon={<StorageIcon sx={iconSx} />}
                            title={authenticatedRoutes.materializations.title}
                            link={authenticatedRoutes.materializations.path}
                        />
                        <ListItemLink
                            icon={<CableIcon sx={iconSx} />}
                            title={authenticatedRoutes.connectors.title}
                            link={authenticatedRoutes.connectors.path}
                        />
                        <ListItemLink
                            icon={<AdminPanelSettingsIcon sx={iconSx} />}
                            title={authenticatedRoutes.admin.title}
                            link={authenticatedRoutes.admin.path}
                        />
                    </List>
                </Box>

                <Box>
                    <UserMenu iconSx={iconSx} />

                    <HelpMenu iconSx={iconSx} />

                    <Box
                        sx={{
                            pt: 0.25,
                            pb: 1,
                            display: 'flex',
                            flexGrow: 1,
                            alignItems: 'center',
                        }}
                    >
                        <ModeSwitch />

                        <Typography sx={{ width: 136, ml: 2, flexShrink: 0 }}>
                            <FormattedMessage id="modeSwitch.label" />
                        </Typography>
                    </Box>

                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                    >
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'navigation.toggle.ariaLabel',
                            })}
                            placement="right-end"
                            enterDelay={open ? 1000 : undefined}
                        >
                            <ListItemButton
                                component="a"
                                onClick={openNavigation}
                                sx={{
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <ListItemIcon sx={{}}>
                                    <KeyboardDoubleArrowLeftIcon
                                        sx={{
                                            ...iconSx,
                                            transform: `rotate(${
                                                open ? '0' : '180'
                                            }deg)`,
                                            transition: 'all 250ms ease-in-out',
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
                    </List>
                </Box>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
