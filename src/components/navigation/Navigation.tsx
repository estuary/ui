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
                    background:
                        'linear-gradient(179.6deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.2) 76.56%, rgba(13, 43, 67, 0.1) 100%)',
                    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
                    borderRadius: '0px 10px 10px 0px',
                    backdropFilter: 'blur(20px)',
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
                        id: 'navigation.ariaLabel',
                    })}
                >
                    <ListItemLink
                        icon={<InputIcon sx={{ color: '#F6FAFF' }} />}
                        title={routeDetails.captures.title}
                        link={routeDetails.captures.path}
                    />
                    <ListItemLink
                        icon={
                            <FormatListNumberedIcon sx={{ color: '#F6FAFF' }} />
                        }
                        title={routeDetails.collections.title}
                        link={routeDetails.collections.path}
                    />
                    <ListItemLink
                        icon={<StorageIcon sx={{ color: '#F6FAFF' }} />}
                        title={routeDetails.materializations.title}
                        link={routeDetails.materializations.path}
                    />
                    <ListItemLink
                        icon={<CableIcon sx={{ color: '#F6FAFF' }} />}
                        title={routeDetails.connectors.title}
                        link={routeDetails.connectors.path}
                    />
                    <ListItemLink
                        icon={
                            <AdminPanelSettingsIcon sx={{ color: '#F6FAFF' }} />
                        }
                        title={routeDetails.admin.title}
                        link={routeDetails.admin.path}
                    />
                </List>
            </Box>
        </MuiDrawer>
    );
};

export default Navigation;
