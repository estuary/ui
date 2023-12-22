import { Box, Tab, Tabs } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';

function AdminTabs() {
    const intl = useIntl();
    const { pathname } = useLocation();
    const [selectedTab, setSelectedTab] = useState(0);

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const hasAdmin = useMemo(
        () => hasLength(Object.keys(adminCapabilities)),
        [adminCapabilities]
    );

    const tabProps = useMemo(() => {
        const response = [
            {
                label: 'admin.tabs.users',
                path: authenticatedRoutes.admin.accessGrants.fullPath,
            },
            {
                label: 'admin.tabs.settings',
                path: authenticatedRoutes.admin.settings.fullPath,
            },
        ];

        if (hasAdmin) {
            response.push({
                label: 'admin.tabs.billing',
                path: authenticatedRoutes.admin.billing.fullPath,
            });
        }

        return response.concat([
            {
                label: 'admin.tabs.connectors',
                path: authenticatedRoutes.admin.connectors.fullPath,
            },
            {
                label: 'admin.tabs.api',
                path: authenticatedRoutes.admin.api.fullPath,
            },
        ]);
    }, [hasAdmin]);

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => {
                if (pathname.startsWith(tabProp.path)) {
                    setSelectedTab(index);
                }

                return (
                    <Tab
                        key={`admin-tabs-${tabProp.label}`}
                        label={intl.formatMessage({
                            id: tabProp.label,
                        })}
                        component={Link}
                        to={tabProp.path}
                    />
                );
            }),
        [intl, pathname, tabProps]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                allowScrollButtonsMobile
                variant="scrollable"
                scrollButtons="auto"
                value={selectedTab}
            >
                {tabs}
            </Tabs>
        </Box>
    );
}

export default AdminTabs;
