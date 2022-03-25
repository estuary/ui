import CodeIcon from '@mui/icons-material/Code';
import Construction from '@mui/icons-material/Construction';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import useChangeSetStore, { ChangeSetState } from 'stores/ChangeSetStore';
import ListItemLink from './ListItemLink';

interface NavigationProps {
    onNavigationToggle: Function;
    open: boolean;
    width: number;
}

const selectors = {
    newChangeCount: (state: ChangeSetState) => state.newChangeCount,
};

const Navigation = (props: NavigationProps) => {
    const { onNavigationToggle, open, width } = props;

    const newChangeCount = useChangeSetStore(selectors.newChangeCount);

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
                        title="Collections"
                        link="/collections"
                        key="Collections"
                        isOpen={open}
                        disabled={true}
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
                        isOpen={open}
                        disabled={true}
                    />
                    <ListItemLink
                        icon={<CodeIcon />}
                        title="Derivations"
                        link="/derivations"
                        key="Derivations"
                        isOpen={open}
                        disabled={true}
                    />
                    <ListItemLink
                        icon={<Construction />}
                        title="Builds"
                        link="/builds"
                        key="Builds"
                        menuWidth={width}
                        badgeContent={newChangeCount}
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
