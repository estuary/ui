import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';

import MuiDrawer from '@mui/material/Drawer';
import ListItemLink from './ListItemLink';

//TODO - These are not final
import InputIcon from '@mui/icons-material/Input';
import TransformIcon from '@mui/icons-material/Transform';
import StorageIcon from '@mui/icons-material/Storage';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ExploreIcon from '@mui/icons-material/Explore';

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
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title="Materializations"
                        link="/app/materializations"
                        key="Materializations"
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title="Administration"
                        link="/app/admin"
                        key="Administration"
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
}

export default Navigation;
