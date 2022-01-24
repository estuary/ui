import CodeIcon from '@mui/icons-material/Code';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import PropTypes from 'prop-types';
import ListItemLink from './ListItemLink';

const NavigationProps = {
    open: PropTypes.bool.isRequired,
    onNavigationToggle: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
};

const Navigation = (props: PropTypes.InferProps<typeof NavigationProps>) => {
    const drawerWidth = props.width;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const closeNavigation = () => {
        props.onNavigationToggle(false);
    };

    return (
        <MuiDrawer
            sx={{
                width: drawerWidth,
                transition: (theme) =>
                    `${theme.transitions.duration.shortest}ms`,
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
                        isOpen={props.open}
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title="Captures"
                        link="/app/captures"
                        key="Capture"
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
        </MuiDrawer>
    );
};

export default Navigation;
