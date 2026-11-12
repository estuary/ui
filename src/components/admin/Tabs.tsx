import type { NavigationTabProps } from 'src/components/shared/NavigationTabs/types';

import { useMemo } from 'react';

import { useLeaf } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

const TAB_KEY = 'admin-tabs';
function AdminTabs() {
    const { ref: accessRef } = useLeaf('Account Access');
    const { ref: settingsRef } = useLeaf('Settings');
    const { ref: billingRef } = useLeaf('Billing');
    const { ref: apiRef } = useLeaf('CLI-API');
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

    const tabProps = useMemo(() => {
        const response: NavigationTabProps[] = [
            {
                labelMessageId: 'admin.tabs.users',
                ref: accessRef,
                path: authenticatedRoutes.admin.accessGrants.fullPath,
            },
            {
                labelMessageId: 'admin.tabs.settings',
                ref: settingsRef,
                path: authenticatedRoutes.admin.settings.fullPath,
            },
        ];

        if (hasAnyAccess) {
            response.push({
                labelMessageId: 'admin.tabs.billing',
                ref: billingRef,
                path: authenticatedRoutes.admin.billing.fullPath,
            });
        }

        response.push({
            labelMessageId: 'admin.tabs.api',
            ref: apiRef,
            path: authenticatedRoutes.admin.api.fullPath,
        });

        return response;
    }, [hasAnyAccess, accessRef, settingsRef, billingRef, apiRef]);

    return <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} />;
}

export default AdminTabs;
