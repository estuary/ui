import FullPageError from 'components/fullPage/Error';
import useTenants from 'hooks/useTenants';
import { createContext, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps, Tenants } from 'types';
import { hasLength } from 'utils/misc-utils';

export interface TenantContextData {
    hasTenants: boolean;
    tenants: Tenants[] | null;
}
const TenantContext = createContext<TenantContextData>({
    hasTenants: false,
    tenants: null,
});

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
        <TenantContext.Provider
            value={{
                hasTenants: !hasLength(tenants),
                tenants,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

// TODO (optimization): Consider defining a hook that returns an array of mapped tenant names.
//   The majority of the components that call useTenantDetails do so to extract a memoized
//   array of tenant names.
const useTenantDetails = () => {
    return useContext(TenantContext);
};

export { TenantContextProvider, useTenantDetails };
