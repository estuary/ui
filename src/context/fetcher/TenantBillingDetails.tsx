import { MAX_TENANTS } from 'api/billing';
import FullPageError from 'components/fullPage/Error';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import { useTenantsDetailsForPayment } from 'hooks/useTenants';
import { createContext, useContext, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_tenantsWithAdmin } from 'stores/Entities/hooks';
import { BaseComponentProps, TenantPaymentDetails } from 'types';

export interface TenantContextData {
    tenantBillingDetails: TenantPaymentDetails[] | null;
}
const TenantContext = createContext<TenantContextData>({
    tenantBillingDetails: null,
});

export const TenantBillingDetailsContextProvider = ({
    children,
}: BaseComponentProps) => {
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    const tenantsWithAdmin = useEntitiesStore_tenantsWithAdmin();

    // TODO (payment method notification)
    // This does work a bit off of a side effect but that is fine for now.
    //  Eventually I'd like to move this provider logic into the payment method
    //  warning handled itself. As it is really the thing that care about these values.

    // We suppress payment warnings for support role anyway so don't bother fetching for them
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
                tenantBillingDetails: tenants,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

// TODO (optimization): Consider defining a hook that returns an array of mapped tenant names.
//   The majority of the components that call useTenantDetails do so to extract a memoized
//   array of tenant names.
export const useTenantBillingDetails = () => {
    return useContext(TenantContext);
};

export const useTenantUsesExternalPayment = (
    selectedTenant: string
): [boolean, string | null] => {
    const { tenantBillingDetails } = useTenantBillingDetails();

    return useMemo(() => {
        if (!tenantBillingDetails) {
            return [false, null];
        }

        const selectedTenantDetails = tenantBillingDetails.find(
            (tenantBillingDetail) =>
                tenantBillingDetail.tenant === selectedTenant
        );

        const marketplaceProvider = selectedTenantDetails?.gcm_account_id
            ? 'gcp'
            : null; //add aws support

        return [
            Boolean(selectedTenantDetails?.payment_provider === 'external'),
            marketplaceProvider,
        ];
    }, [selectedTenant, tenantBillingDetails]);
};
