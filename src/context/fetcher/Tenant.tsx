import FullPageError from 'components/fullPage/Error';
import useTenants from 'hooks/useTenants';
import { createContext, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps, Tenants } from 'types';

const TenantContext = createContext<Tenants[] | null>(null);

const TenantContextProvider = ({ children }: BaseComponentProps) => {
    const { tenants, error, isValidating } = useTenants();

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="tenant.error.failedToFetch.message" />
                }
            />
        );
    }

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
