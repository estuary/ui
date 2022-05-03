import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CableIcon from '@mui/icons-material/Cable';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
//TODO (UI / UX) - These icons are not final
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
                <List
                    aria-label={intl.formatMessage({
                        id: 'header.navigation.ariaLabel',
                    })}
                >
                    <ListItemLink
                        icon={<InputIcon />}
                        title={routeDetails.captures.title}
                        link={routeDetails.captures.path}
                    />
                    <ListItemLink
                        icon={<FormatListNumberedIcon />}
                        title={routeDetails.collections.title}
                        link={routeDetails.collections.path}
                    />
                    <ListItemLink
                        icon={<StorageIcon />}
                        title={routeDetails.materializations.title}
                        link={routeDetails.materializations.path}
                    />
                    <ListItemLink
                        icon={<CableIcon />}
                        title={routeDetails.connectors.title}
                        link={routeDetails.connectors.path}
                    />
                    <ListItemLink
                        icon={<AdminPanelSettingsIcon />}
                        title={routeDetails.admin.title}
                        link={routeDetails.admin.path}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
