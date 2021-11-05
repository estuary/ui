import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import TransformIcon from '@mui/icons-material/Transform';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import ListItemLink from './ListItemLink';

type navigationProps = {
    open: boolean;
    onNavigationToggle: Function;
    width: number;
};

function Navigation(props: navigationProps) {
    const drawerWidth = props.width;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const closeNavigation = () => {
        props.onNavigationToggle(false);
    };

    return (
        <MuiDrawer
            sx={{
                transition: (theme) =>
                    `${theme.transitions.duration.shortest}ms`,
                width: drawerWidth,
                '& .MuiDrawer-paper': {
                    transition: (theme) =>
                        `${theme.transitions.duration.shortest}ms`,
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            anchor="left"
            open={props.open}
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
                        title="Collections"
                        link="/app/collections"
                        key="Collections"
                        disabled={true}
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title="Captures"
                        link="/app/captures"
                        key="Capture"
                    />
                    <ListItemLink
                        icon={<TransformIcon />}
                        title="Derivations"
                        link="/app/derivations"
                        key="Derivations"
                        disabled={true}
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title="Materializations"
                        link="/app/materializations"
                        key="Materializations"
                        disabled={true}
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title="Administration"
                        link="/app/admin"
                        key="Administration"
                        disabled={true}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
}

export default Navigation;
