import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import HelpMenu from './help/HelpMenu';
import Logo from './navigation/Logo';

type TopbarProps = {
    isNavigationOpen: boolean;
    onNavigationToggle: Function;
    title: string;
};

const Topbar: React.FC<TopbarProps> = ({ onNavigationToggle }) => {
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
                        aria-label="Expand Navigation"
                        onClick={openNavigation}
                        edge="start"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
                <Logo alt="Estuary" width={120} />

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
                    <HelpMenu />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
