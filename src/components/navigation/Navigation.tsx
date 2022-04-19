import ExploreIcon from '@mui/icons-material/Explore';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
//TODO - These icons are not final
import InputIcon from '@mui/icons-material/Input';
import StorageIcon from '@mui/icons-material/Storage';
import { Box, List, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { routeDetails } from 'app/Authenticated';
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
                        title={intl.formatMessage({
                            id: routeDetails.home.title,
                        })}
                        link={routeDetails.home.path}
                        key={intl.formatMessage({
                            id: routeDetails.home.title,
                        })}
                    />
                    <ListItemLink
                        icon={<InputIcon />}
                        title={intl.formatMessage({
                            id: routeDetails.captures.title,
                        })}
                        link={routeDetails.captures.path}
                        key={intl.formatMessage({
                            id: routeDetails.captures.title,
                        })}
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title={intl.formatMessage({
                            id: routeDetails.materializations.title,
                        })}
                        link={routeDetails.materializations.path}
                        key={intl.formatMessage({
                            id: routeDetails.materializations.title,
                        })}
                    />
                    <ListItemLink
                        icon={<HomeRepairServiceIcon />}
                        title={intl.formatMessage({
                            id: routeDetails.admin.title,
                        })}
                        link={routeDetails.admin.path}
                        key={intl.formatMessage({
                            id: routeDetails.admin.title,
                        })}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
