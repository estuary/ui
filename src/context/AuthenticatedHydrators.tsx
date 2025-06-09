import type { BaseComponentProps } from 'src/types';

import { TenantBillingDetailsContextProvider } from 'src/context/fetcher/TenantBillingDetails';
import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';
import { StorageMappingsHydrator } from 'src/stores/Entities/StorageMappingsHydrator';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return (
        <EntitiesHydrator>
            <StorageMappingsHydrator>
                <TenantBillingDetailsContextProvider>
                    {children}
                </TenantBillingDetailsContextProvider>
            </StorageMappingsHydrator>
        </EntitiesHydrator>
    );
}

export default AuthenticatedHydrators;
