import { Skeleton, Typography } from '@mui/material';
import { useTenantBillingDetails } from 'context/fetcher/TenantBillingDetails';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';

function PricingTierDetails() {
    const { tenantBillingDetails } = useTenantBillingDetails();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const paymentMethodExists = useBillingStore(
        (state) => state.paymentMethodExists
    );

    const externalPaymentMethod = useMemo(() => {
        return !tenantBillingDetails
            ? false
            : tenantBillingDetails.some((tenantBillingDetail) => {
                  return (
                      tenantBillingDetail.tenant === selectedTenant &&
                      tenantBillingDetail.payment_provider === 'external'
                  );
              });
    }, [selectedTenant, tenantBillingDetails]);

    const messageId = useMemo(
        () =>
            externalPaymentMethod
                ? 'admin.billing.message.external'
                : paymentMethodExists
                ? 'admin.billing.message.paidTier'
                : 'admin.billing.message.freeTier',
        [externalPaymentMethod, paymentMethodExists]
    );

    if (!billingStoreHydrated || typeof paymentMethodExists !== 'boolean') {
        return (
            <Skeleton>
                <Typography>
                    <FormattedMessage id={messageId} />
                </Typography>
            </Skeleton>
        );
    } else {
        return (
            <Typography>
                <FormattedMessage id={messageId} />
            </Typography>
        );
    }
}

export default PricingTierDetails;
