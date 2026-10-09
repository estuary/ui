import type { NavigationTabProps } from 'src/components/shared/NavigationTabs/types';

import { useMemo } from 'react';

import { authenticatedRoutes } from 'src/app/routes';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

const TAB_KEY = 'admin-tabs';
function AdminTabs() {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

    const tabProps = useMemo(() => {
        const response: NavigationTabProps[] = [
            {
                labelMessageId: 'admin.tabs.users',
                path: authenticatedRoutes.admin.accessGrants.fullPath,
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

        response.push({
            labelMessageId: 'admin.tabs.serviceAccounts',
            path: authenticatedRoutes.admin.serviceAccounts.fullPath,
        });

        return response;
    }, [hasAnyAccess]);

    return <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} />;
}

export default AdminTabs;
