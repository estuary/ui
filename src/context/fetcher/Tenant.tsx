import { MAX_TENANTS } from 'api/billing';
import FullPageError from 'components/fullPage/Error';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import { useTenantsDetailsForPayment } from 'hooks/useTenants';
import { createContext, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_tenantsWithAdmin } from 'stores/Entities/hooks';
import { BaseComponentProps, Tenants } from 'types';

export interface TenantContextData {
    tenantsBillingDetails: Tenants[] | null;
}
const TenantContext = createContext<TenantContextData>({
    tenantsBillingDetails: null,
});

const TenantBillingDetailsContextProvider = ({
    children,
}: BaseComponentProps) => {
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    const tenantsWithAdmin = useEntitiesStore_tenantsWithAdmin();

    // These
    const { tenants, error, isValidating } = useTenantsDetailsForPayment(
        hasSupportRole ? [] : tenantsWithAdmin.slice(0, MAX_TENANTS)
    );

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
                tenantsBillingDetails: tenants,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

// TODO (optimization): Consider defining a hook that returns an array of mapped tenant names.
//   The majority of the components that call useTenantDetails do so to extract a memoized
//   array of tenant names.
const useTenantBillingDetails = () => {
    return useContext(TenantContext);
};

export { TenantBillingDetailsContextProvider, useTenantBillingDetails };
