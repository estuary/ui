
import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';
import type { BaseComponentProps } from 'src/types';
import { TenantBillingDetailsContextProvider } from 'src/context/fetcher/TenantBillingDetails';

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
