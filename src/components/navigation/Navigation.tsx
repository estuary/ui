import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CableIcon from '@mui/icons-material/Cable';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
//TODO (UI / UX) - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import {
    Box,
    IconButton,
    List,
    SxProps,
    Theme,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { routeDetails } from 'app/Authenticated';
import HelpMenu from 'components/menus/HelpMenu';
import UserMenu from 'components/menus/UserMenu';
import Logo from 'components/navigation/Logo';
import { FormattedMessage, useIntl } from 'react-intl';
import ListItemLink from './ListItemLink';

interface MenuButtonProps {
    ariaLabel: string;
    openNavigation: () => void;
}

interface NavigationProps {
    open: boolean;
    width: number;
    onNavigationToggle: Function;
}

const MenuButton = ({ ariaLabel, openNavigation }: MenuButtonProps) => {
    return (
        <IconButton
            aria-label={ariaLabel}
            onClick={openNavigation}
            sx={{
                display: 'inline-flex',
                justifyContent: 'left',
                flexShrink: 0,
            }}
        >
            <Logo width={20} />
        </IconButton>
    );
};

const Navigation = ({ open, width, onNavigationToggle }: NavigationProps) => {
    const intl = useIntl();

    const theme = useTheme();
    const listItemIconSx: SxProps<Theme> = {
        color: theme.palette.text.primary,
    };

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
                    background:
                        'linear-gradient(179.6deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.2) 76.56%, rgba(13, 43, 67, 0.1) 100%)',
                    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
                    borderRadius: '0px 10px 10px 0px',
                    backdropFilter: 'blur(20px)',
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
                        {open ? (
                            <MenuButton
                                ariaLabel={intl.formatMessage({
                                    id: 'header.openNavigation.ariaLabel',
                                })}
                                openNavigation={openNavigation}
                            />
                        ) : (
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'mainMenu.tooltip',
                                })}
                                placement="right-end"
                            >
                                <span>
                                    <MenuButton
                                        ariaLabel={intl.formatMessage({
                                            id: 'header.openNavigation.ariaLabel',
                                        })}
                                        openNavigation={openNavigation}
                                    />
                                </span>
                            </Tooltip>
                        )}

                        <Typography
                            sx={{ width: 136, ml: '22px', flexShrink: 0 }}
                        >
                            <FormattedMessage id="company" />
                        </Typography>
                    </Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            icon={<InputIcon sx={listItemIconSx} />}
                            title={routeDetails.captures.title}
                            link={routeDetails.captures.path}
                        />
                        <ListItemLink
                            icon={
                                <FormatListNumberedIcon sx={listItemIconSx} />
                            }
                            title={routeDetails.collections.title}
                            link={routeDetails.collections.path}
                        />
                        <ListItemLink
                            icon={<StorageIcon sx={listItemIconSx} />}
                            title={routeDetails.materializations.title}
                            link={routeDetails.materializations.path}
                        />
                        <ListItemLink
                            icon={<CableIcon sx={listItemIconSx} />}
                            title={routeDetails.connectors.title}
                            link={routeDetails.connectors.path}
                        />
                        <ListItemLink
                            icon={
                                <AdminPanelSettingsIcon sx={listItemIconSx} />
                            }
                            title={routeDetails.admin.title}
                            link={routeDetails.admin.path}
                        />
                    </List>
                </Box>

                <Box sx={{ pl: 1 }}>
                    <UserMenu />

                    <HelpMenu />

                    {/* <Box
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
                    </Box> */}
                </Box>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
