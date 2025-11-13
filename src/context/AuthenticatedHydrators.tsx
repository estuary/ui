import type { BaseComponentProps } from 'src/types';

import { TenantBillingDetailsContextProvider } from 'src/context/fetcher/TenantBillingDetails';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';
import { EntitiesHydratorForSupport } from 'src/stores/Entities/HydratorForSupport';
import { StorageMappingsHydrator } from 'src/stores/Entities/StorageMappingsHydrator';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    const hasSupportRole = useUserInfoSummaryStore(
        // (state) => true
        (state) => state.hasSupportAccess
    );

    console.log('AuthenticatedHydrators : hasSupportRole : ', hasSupportRole);

    const EntityHydratorComponent = hasSupportRole
        ? EntitiesHydratorForSupport
        : EntitiesHydrator;

    return (
        <EntityHydratorComponent>
            <StorageMappingsHydrator>
                <TenantBillingDetailsContextProvider>
                    {children}
                </TenantBillingDetailsContextProvider>
            </StorageMappingsHydrator>
        </EntityHydratorComponent>
    );
}

export default AuthenticatedHydrators;
