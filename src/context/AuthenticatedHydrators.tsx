import { EntitiesHydrator } from 'stores/Entities/Hydrator';
import { BaseComponentProps } from 'types';
import { TenantContextProvider } from './fetcher/Tenant';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return (
        <EntitiesHydrator>
            <TenantContextProvider>{children}</TenantContextProvider>
        </EntitiesHydrator>
    );
}

export default AuthenticatedHydrators;
