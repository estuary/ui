import type { NavigationTabProps } from 'src/components/shared/NavigationTabs/types';

import { useMemo } from 'react';

import { authenticatedRoutes } from 'src/app/routes';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useTenantStore } from 'src/stores/Tenant/Store';

const TAB_KEY = 'admin-tabs';
function AdminTabs() {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const tabProps = useMemo(() => {
        const response: NavigationTabProps[] = [
            {
                labelMessageId: 'admin.tabs.users',
                path: authenticatedRoutes.admin.accessGrants.fullPath,
            },
            {
                labelMessageId: 'admin.tabs.notifications',
                path: authenticatedRoutes.admin.notifications.fullPath,
            },
            {
                labelMessageId: 'admin.tabs.settings',
                path: authenticatedRoutes.admin.settings.fullPath,
            },
        ];

        if (hasAnyAccess) {
            response.push({
                labelMessageId: 'admin.tabs.billing',
                path: authenticatedRoutes.admin.billing.fullPath,
            });
        }

        return response.concat([
            {
                labelMessageId: 'admin.tabs.connectors',
                path: authenticatedRoutes.admin.connectors.fullPath,
            },
            {
                labelMessageId: 'admin.tabs.api',
                path: authenticatedRoutes.admin.api.fullPath,
            },
        ]);
    }, [hasAnyAccess, selectedTenant]);

    return <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} />;
}

export default AdminTabs;
