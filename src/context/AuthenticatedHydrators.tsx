import type { BaseComponentProps } from 'src/types';

import { TenantBillingDetailsContextProvider } from 'src/context/fetcher/TenantBillingDetails';
import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return (
        <EntitiesHydrator>
            <TenantBillingDetailsContextProvider>
                {children}
            </TenantBillingDetailsContextProvider>
        </EntitiesHydrator>
    );
}

export default AuthenticatedHydrators;
