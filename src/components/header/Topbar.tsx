import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import UserMenu from 'components/menus/UserMenu';
import { useIntl } from 'react-intl';
import { useAuth } from '../../context/Auth';
import HelpMenu from '../menus/HelpMenu';
import Logo from '../navigation/Logo';

type TopbarProps = {
    isNavigationOpen: boolean;
    onNavigationToggle?: Function;
};

const Topbar: React.FC<TopbarProps> = (props: TopbarProps) => {
    const { onNavigationToggle } = props;
    const intl = useIntl();
    const theme = useTheme();
    const { user } = useAuth();

    const openNavigation = () => {
        onNavigationToggle?.(true);
    };

    return (
        <MuiAppBar
            sx={{
                boxShadow: 'none',
                position: 'fixed',
                [theme.breakpoints.down('md')]: {
                    zIndex: theme.zIndex.drawer,
                },
                [theme.breakpoints.up('md')]: {
                    zIndex: theme.zIndex.drawer + 1,
                },
            }}
        >
            <Toolbar
                sx={{
                    justifyContent: 'center',
                    px: 1,
                }}
            >
                {user ? (
                    <Box
                        sx={{
                            mr: 1,
                        }}
                    >
                        <IconButton
                            aria-label={intl.formatMessage({
                                id: 'header.navigationMenu.aria.label',
                            })}
                            onClick={openNavigation}
                            edge="start"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                ) : null}

                <Box
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <Logo width={120} />
                </Box>

                <Stack
                    direction="row"
                    spacing={0}
                    alignItems="center"
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <HelpMenu />
                    <UserMenu />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
