import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
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
    Stack,
    Toolbar,
    Tooltip,
    useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { authenticatedRoutes } from 'app/routes';
import ModeSwitch from 'components/navigation/ModeSwitch';
import { paperBackground } from 'context/Theme';
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
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    transition: (paperTheme) =>
                        `${paperTheme.transitions.duration.shortest}ms`,
                    width,
                    border: 0,
                    background: paperBackground[theme.palette.mode],
                },
                'transition': (drawerTheme) =>
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
                            id: 'navigation.toggle.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            icon={<HomeIcon />}
                            title={authenticatedRoutes.home.title}
                            link={authenticatedRoutes.home.path}
                        />
                        <ListItemLink
                            icon={<InputIcon />}
                            title={authenticatedRoutes.captures.title}
                            link={authenticatedRoutes.captures.path}
                        />
                        <ListItemLink
                            icon={<FormatListNumberedIcon />}
                            title={authenticatedRoutes.collections.title}
                            link={authenticatedRoutes.collections.path}
                        />
                        <ListItemLink
                            icon={<StorageIcon />}
                            title={authenticatedRoutes.materializations.title}
                            link={authenticatedRoutes.materializations.path}
                        />
                        <ListItemLink
                            icon={<AdminPanelSettingsIcon />}
                            title={authenticatedRoutes.admin.title}
                            link={authenticatedRoutes.admin.path}
                        />
                    </List>
                </Box>

                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                        sx={{
                            py: 1,
                        }}
                    >
                        <ModeSwitch />

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
                                    minHeight: 45,
                                    px: 1.5,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <KeyboardDoubleArrowLeftIcon
                                        sx={{
                                            color: theme.palette.text.primary,
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
            </Stack>
        </MuiDrawer>
    );
};

export default Navigation;
