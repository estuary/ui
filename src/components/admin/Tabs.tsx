import { Box, Tab, Tabs } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { hasLength } from 'utils/misc-utils';

function AdminTabs() {
    const intl = useIntl();
    const { pathname } = useLocation();
    const [selectedTab, setSelectedTab] = useState(0);
    const tenantDetails = useTenantDetails();

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

        if (hasLength(tenantDetails)) {
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
    }, [tenantDetails]);

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
