import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import HelpMenu from '../help/HelpMenu';
import Logo from '../navigation/Logo';

type TopbarProps = {
    isNavigationOpen: boolean;
    onNavigationToggle: Function;
    title: string;
};

const Topbar: React.FC<TopbarProps> = ({ onNavigationToggle }) => {
    const intl = useIntl();
    const theme = useTheme();

    const openNavigation = () => {
        onNavigationToggle(true);
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
                    px: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        mr: 1,
                    }}
                >
                    <IconButton
                        aria-label={intl.formatMessage({ id: "header.navigationMenu.aria.label" })}
                        onClick={openNavigation}
                        edge="start"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
                <Logo alt={intl.formatMessage({ id: "company" })} width={120} />

                {/* <Paper
                    variant="outlined"
                    sx={{
                        mr: 2,
                    }}
                >
                    <InputBase
                        sx={{ flex: 1 }}
                        placeholder="Search everything"
                        inputProps={{ 'aria-label': 'Global search' }}
                    />
                    <IconButton
                        type="submit"
                        sx={{ p: '10px' }}
                        aria-label="search"
                    >
                        <SearchIcon />
                    </IconButton>
                </Paper> */}

                <Stack direction="row" spacing={2}>
                    {/* <IconButton aria-label="Open alerts panel">
                        <Badge
                            badgeContent={0}
                            variant="dot"
                            overlap="circular"
                            color="info"
                        >
                            <NotificationsIcon />
                        </Badge>
                    </IconButton> */}
                    <IconButton aria-label='Open account panel'>
                        <AccountCircleIcon />
                    </IconButton>
                    <HelpMenu />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
