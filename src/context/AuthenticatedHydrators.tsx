import { EntitiesHydrator } from 'src/stores/Entities/Hydrator';
import { BaseComponentProps } from 'src/types';
import { TenantBillingDetailsContextProvider } from './fetcher/TenantBillingDetails';

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
