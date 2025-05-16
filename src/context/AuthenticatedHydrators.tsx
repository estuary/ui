import type { BaseComponentProps } from 'src/types';

import { TenantBillingDetailsContextProvider } from 'src/context/fetcher/TenantBillingDetails';
import { DataPlanesHydrator } from 'src/stores/Entities/DataPlanesHydrator';
import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';
import { StorageMappingsHydrator } from 'src/stores/Entities/StorageMappingsHydrator';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return (
        <EntitiesHydrator>
            <StorageMappingsHydrator>
                <DataPlanesHydrator>
                    <TenantBillingDetailsContextProvider>
                        {children}
                    </TenantBillingDetailsContextProvider>
                </DataPlanesHydrator>
            </StorageMappingsHydrator>
        </EntitiesHydrator>
    );
}

export default AuthenticatedHydrators;
