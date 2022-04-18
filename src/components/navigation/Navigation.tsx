import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import {
    adminRoute,
    capturesRoute,
    homeRoute,
    materializationsRoute,
} from 'app/Authenticated';
import { useIntl } from 'react-intl';
import ListItemLink from './ListItemLink';

interface Props {
    onNavigationToggle: Function;
    open: boolean;
    width: number;
}

const Navigation = ({ onNavigationToggle, open, width }: Props) => {
    const intl = useIntl();
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
                        title={intl.formatMessage({ id: homeRoute.title })}
                        link={homeRoute.path}
                        key={intl.formatMessage({ id: homeRoute.title })}
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title={intl.formatMessage({ id: capturesRoute.title })}
                        link={capturesRoute.path}
                        key={intl.formatMessage({ id: capturesRoute.title })}
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title={intl.formatMessage({
                            id: materializationsRoute.title,
                        })}
                        link={materializationsRoute.path}
                        key={intl.formatMessage({
                            id: materializationsRoute.title,
                        })}
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title={intl.formatMessage({ id: adminRoute.title })}
                        link={adminRoute.path}
                        key={intl.formatMessage({ id: adminRoute.title })}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
