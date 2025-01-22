import { Skeleton, Typography } from '@mui/material';
import { useTenantUsesExternalPayment } from 'context/fetcher/TenantBillingDetails';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';

function PricingTierDetails() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const externalPaymentMethod = useTenantUsesExternalPayment(selectedTenant);

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const paymentMethodExists = useBillingStore(
        (state) => state.paymentMethodExists
    );

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
