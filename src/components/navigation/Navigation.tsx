import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CableIcon from '@mui/icons-material/Cable';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
//TODO (UI / UX) - These icons are not final
import HomeIcon from '@mui/icons-material/Home';
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
    Toolbar,
    Tooltip,
    useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { authenticatedRoutes } from 'app/Authenticated';
import ModeSwitch from 'components/navigation/ModeSwitch';
import { darkGlassBkgWithBlur, lightGlassBkgWithBlur } from 'context/Theme';
import { useIntl } from 'react-intl';
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
                    border: 0,
                    ...paperBackground,
                },
                'transition': (drawerTheme) =>
                    `${drawerTheme.transitions.duration.shortest}ms`,
                width,
            }}
        >
            <Toolbar />
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
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            icon={<HomeIcon sx={iconSx} />}
                            title={authenticatedRoutes.home.title}
                            link={authenticatedRoutes.home.path}
                        />
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
                    <Box
                        sx={{
                            pb: 1,
                            pl: open ? 2 : 1,
                        }}
                    >
                        <ModeSwitch hideText={!open} />
                    </Box>

                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                        sx={{
                            py: 0,
                        }}
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
                                    minHeight: 60,
                                    maxHeight: 60,
                                }}
                            >
                                <ListItemIcon sx={{}}>
                                    <KeyboardDoubleArrowLeftIcon
                                        sx={{
                                            ...iconSx,
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
                    </List>
                </Box>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
