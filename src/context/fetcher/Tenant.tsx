import useTenants from 'hooks/useTenants';
import { createContext, useContext } from 'react';
import { BaseComponentProps, Tenants } from 'types';

const TenantContext = createContext<Tenants[] | null>(null);
const TenantContextProvider = ({ children }: BaseComponentProps) => {
    const { tenants, isValidating } = useTenants();

    if (isValidating) {
        return null;
    }

    return (
        <TenantContext.Provider value={tenants}>
            {children}
        </TenantContext.Provider>
    );
};

const useTenantDetails = () => {
    return useContext(TenantContext);
};

export { TenantContextProvider, useTenantDetails };
