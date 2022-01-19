import CodeIcon from '@mui/icons-material/Code';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
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

    const Drawer = styled(MuiDrawer)(({ theme }) => ({
        transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
        }),
        width: drawerWidth,
        '& .MuiDrawer-paper': {
            transition: theme.transitions.create(['width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shortest,
            }),
            width: drawerWidth,
            boxSizing: 'border-box',
        },
    }));

    return (
        <Drawer
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
                        isOpen={props.open}
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title="Captures"
                        link="/app/captures"
                        key="Capture"
                        isOpen={props.open}
                    />
                    <ListItemLink
                        icon={<CodeIcon />}
                        title="Derivations"
                        link="/app/derivations"
                        key="Derivations"
                        isOpen={props.open}
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title="Materializations"
                        link="/app/materializations"
                        key="Materializations"
                        isOpen={props.open}
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title="Administration"
                        link="/app/admin"
                        key="Administration"
                        isOpen={props.open}
                    />
                </List>
            </Box>
        </Drawer>
    );
}

export default Navigation;
