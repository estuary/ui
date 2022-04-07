import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import ListItemLink from './ListItemLink';

interface Props {
    onNavigationToggle: Function;
    open: boolean;
    width: number;
}

const Navigation = ({ onNavigationToggle, open, width }: Props) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const closeNavigation = () => {
        onNavigationToggle(false);
    };

    return (
        <MuiDrawer
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    transition: (paperTheme) =>
                        `${paperTheme.transitions.duration.shortest}ms`,
                    width,
                },
                'transition': (drawerTheme) =>
                    `${drawerTheme.transitions.duration.shortest}ms`,
                width,
            }}
            anchor="left"
            open={open}
            onClose={closeNavigation}
            onClick={isBelowMd ? closeNavigation : undefined}
            variant={isBelowMd ? 'temporary' : 'permanent'}
            ModalProps={{
                keepMounted: true,
            }}
        >
            <Toolbar />
            <Box sx={{ overflowX: 'hidden' }}>
                <List aria-label="main application navigation">
                    <ListItemLink
                        icon={<ExploreIcon />}
                        title="Dashboard"
                        link="/dashboard"
                        key="Dashboard"
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title="Captures"
                        link="/captures"
                        key="Capture"
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title="Materializations"
                        link="/materializations"
                        key="Materializations"
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title="Administration"
                        link="/admin"
                        key="Administration"
                        isOpen={open}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
