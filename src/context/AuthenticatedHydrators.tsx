import { EntitiesHydrator } from 'stores/Entities/Hydrator';
import { BaseComponentProps } from 'types';
import { TenantBillingDetailsContextProvider } from './fetcher/Tenant';

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
