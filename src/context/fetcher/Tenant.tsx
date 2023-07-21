import { BaseComponentProps, Tenants } from 'types';

import { createContext, useContext } from 'react';

import FullPageSpinner from 'components/fullPage/Spinner';

import useTenants from 'hooks/useTenants';

const TenantContext = createContext<Tenants[] | null>(null);
const TenantContextProvider = ({ children }: BaseComponentProps) => {
    const { tenants, isValidating } = useTenants();

    if (isValidating) {
        return <FullPageSpinner />;
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
