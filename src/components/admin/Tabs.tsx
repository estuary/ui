import GroupIcon from '@mui/icons-material/Group';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Box, Tab, Tabs } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

interface Props {
    selectedTab: number;
}

function AdminTabs({ selectedTab }: Props) {
    const intl = useIntl();

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} aria-label="basic tabs example">
                <Tab
                    label={intl.formatMessage({
                        id: 'admin.tabs.users',
                    })}
                    icon={<GroupIcon />}
                    iconPosition="start"
                    component={Link}
                    to={authenticatedRoutes.admin.accressGrants.fullPath}
                />
                <Tab
                    label={intl.formatMessage({ id: 'admin.tabs.api' })}
                    icon={<TerminalIcon />}
                    iconPosition="start"
                    component={Link}
                    to={authenticatedRoutes.admin.api.fullPath}
                />
            </Tabs>
        </Box>
    );
}

export default AdminTabs;
