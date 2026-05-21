import React from 'react';

import {
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Tooltip,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';

import { CloudDownload, CloudUpload, GitFork, Plus } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { HeaderPill } from 'src/components/AgentSkills/HeaderPill';
import CompanyLogo from 'src/components/graphics/CompanyLogo';
import CompanyMark from 'src/components/graphics/CompanyMark';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';
import { authenticatedRoutes } from 'src/app/routes';

interface TopbarProps {
    navigationOpen?: boolean;
}

const Topbar = ({ navigationOpen = true }: TopbarProps) => {
    const theme = useTheme();
    const intl = useIntl();
    const navigate = useNavigate();

    const [menuAnchor, setMenuAnchor] =
        React.useState<HTMLElement | null>(null);

    return (
        <MuiAppBar
            sx={{
                position: 'static',
                boxShadow: 'none',
                background:theme.palette.background.default
                // background:"gray"
            }}
        >
            <Toolbar
                variant="dense"
                sx={{
                    px: 0,
                    minHeight: 48,
                    justifyContent: 'space-between',
                }}
            >
                {navigationOpen ? <CompanyLogo /> : <CompanyMark />}

                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <HeaderPill />
                    <UpdateAlert />

                    <Tooltip
                        title={intl.formatMessage({ id: 'cta.new' })}
                    >
                        <IconButton
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            size="small"
                            sx={{ color: theme.palette.text.primary, bgcolor: 'action.hover', borderRadius: 4 }}
                        >
                            <Plus size={20} strokeWidth={2} />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        onClick={() => setMenuAnchor(null)}
                        anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                        }}
                        transformOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                void navigate(
                                    authenticatedRoutes.captures.create.fullPath
                                );
                            }}
                        >
                            <ListItemIcon>
                                <CloudUpload size={16} strokeWidth={1.5} />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.captureCreate" />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                void navigate(
                                    authenticatedRoutes.collections.create.fullPath
                                );
                            }}
                        >
                            <ListItemIcon>
                                <GitFork size={16} strokeWidth={1.5} />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.collectionCreate" />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                void navigate(
                                    authenticatedRoutes.materializations.create.fullPath
                                );
                            }}
                        >
                            <ListItemIcon>
                                <CloudDownload size={16} strokeWidth={1.5} />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.materializationCreate" />
                        </MenuItem>
                    </Menu>

                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
