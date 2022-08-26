import GroupIcon from '@mui/icons-material/Group';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Box, Tab, Tabs } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import useConstant from 'use-constant';

function AdminTabs() {
    const intl = useIntl();
    const { pathname } = useLocation();
    const [selectedTab, setSelectedTab] = useState(0);

    const tabProps = useConstant(() => [
        {
            label: 'admin.tabs.users',
            icon: GroupIcon,
            path: authenticatedRoutes.admin.accressGrants.fullPath,
        },
        {
            label: 'admin.tabs.api',
            icon: TerminalIcon,
            path: authenticatedRoutes.admin.api.fullPath,
        },
    ]);

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => {
                if (tabProp.path === pathname) {
                    setSelectedTab(index);
                }

                return (
                    <Tab
                        key={`admin-tabs-${tabProp.label}`}
                        label={intl.formatMessage({
                            id: tabProp.label,
                        })}
                        icon={<tabProp.icon />}
                        iconPosition="start"
                        component={Link}
                        to={tabProp.path}
                    />
                );
            }),
        [intl, pathname, tabProps]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} aria-label="basic tabs example">
                {tabs}
            </Tabs>
        </Box>
    );
}

export default AdminTabs;
