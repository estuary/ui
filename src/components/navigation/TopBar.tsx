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

import { CloudDownload, CloudUpload, GitFork, Plus } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { authenticatedRoutes } from 'src/app/routes';
import CompanyLogo from 'src/components/graphics/CompanyLogo';
import CompanyMark from 'src/components/graphics/CompanyMark';
import HelpMenu from 'src/components/menus/HelpMenu';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';

interface TopbarProps {
    navigationOpen?: boolean;
}

const Topbar = ({ navigationOpen = true }: TopbarProps) => {
    const intl = useIntl();
    const navigate = useNavigate();

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );

    return (
        <MuiAppBar>
            <Toolbar
                variant="dense"
                sx={{
                    pl: '19px !important',
                    minHeight: 48,
                    justifyContent: 'space-between',
                }}
            >
                {navigationOpen ? <CompanyLogo /> : <CompanyMark />}

                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                >
                    <UpdateAlert />

                    <Tooltip title={intl.formatMessage({ id: 'cta.new' })}>
                        <IconButton
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            size="small"
                            sx={{
                                'color': 'primary.contrastText',
                                'bgcolor': 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' },
                            }}
                        >
                            <Plus style={{ strokeWidth: 2.25 }} />
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
                                <CloudUpload />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.captureCreate" />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                void navigate(
                                    authenticatedRoutes.collections.create
                                        .fullPath
                                );
                            }}
                        >
                            <ListItemIcon>
                                <GitFork />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.collectionCreate" />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                void navigate(
                                    authenticatedRoutes.materializations.create
                                        .fullPath
                                );
                            }}
                        >
                            <ListItemIcon>
                                <CloudDownload />
                            </ListItemIcon>
                            <FormattedMessage id="routeTitle.materializationCreate" />
                        </MenuItem>
                    </Menu>

                    <HelpMenu />

                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
