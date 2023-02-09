import { Box, Tab, Tabs } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { osanoActive } from 'services/osano';
import useConstant from 'use-constant';

function AdminTabs() {
    const intl = useIntl();
    const { pathname } = useLocation();
    const [selectedTab, setSelectedTab] = useState(0);

    const tabProps = useConstant(() => {
        const response = [
            {
                label: 'admin.tabs.users',
                path: authenticatedRoutes.admin.accessGrants.fullPath,
            },
            {
                label: 'admin.tabs.storageMappings',
                path: authenticatedRoutes.admin.storageMappings.fullPath,
            },
            {
                label: 'admin.tabs.connectors',
                path: authenticatedRoutes.admin.connectors.fullPath,
            },
            {
                label: 'admin.tabs.api',
                path: authenticatedRoutes.admin.api.fullPath,
            },
        ];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (osanoActive()) {
            response.push({
                label: 'admin.tabs.cookies',
                path: authenticatedRoutes.admin.cookies.fullPath,
            });
        }

        return response;
    });

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
