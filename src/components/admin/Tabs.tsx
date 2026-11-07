import type { NavigationTabProps } from 'src/components/shared/NavigationTabs/types';

import { useMemo } from 'react';

import { useSemanticLeaf } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

const TAB_KEY = 'admin-tabs';
function AdminTabs() {
    const { ref: accessGrantsRef } =
        useSemanticLeaf<HTMLAnchorElement>('Access Grants');
    const { ref: settingsRef } = useSemanticLeaf<HTMLAnchorElement>('Settings');
    const { ref: billingRef } = useSemanticLeaf<HTMLAnchorElement>('Billing');
    const { ref: apiRef } = useSemanticLeaf<HTMLAnchorElement>('API');
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

    const tabProps = useMemo(() => {
        const response: NavigationTabProps[] = [
            {
                label: 'Account Access',
                tabRef: accessGrantsRef,
                path: authenticatedRoutes.admin.accessGrants.fullPath,
            },
            {
                label: 'Settings',
                tabRef: settingsRef,
                path: authenticatedRoutes.admin.settings.fullPath,
            },
        ];

        if (hasAnyAccess) {
            response.push({
                label: 'Billing',
                tabRef: billingRef,
                path: authenticatedRoutes.admin.billing.fullPath,
            });
        }

        response.push({
            label: 'CLI-API',
            tabRef: apiRef,
            path: authenticatedRoutes.admin.api.fullPath,
        });

        return response;
    }, [hasAnyAccess, accessGrantsRef, settingsRef, billingRef, apiRef]);

    return <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} />;
}

export default AdminTabs;
