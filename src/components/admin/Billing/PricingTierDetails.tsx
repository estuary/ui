import { Skeleton, Typography } from '@mui/material';
import { useTenantUsesExternalPayment } from 'context/fetcher/TenantBillingDetails';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';

function PricingTierDetails() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const [externalPaymentMethod, marketPlaceProvider] =
        useTenantUsesExternalPayment(selectedTenant);

    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const paymentMethodExists = useBillingStore(
        (state) => state.paymentMethodExists
    );

    const messageId = useMemo(() => {
        if (externalPaymentMethod) {
            if (marketPlaceProvider === 'gcp') {
                return 'admin.billing.message.external.gcp';
            }

            if (marketPlaceProvider === 'aws') {
                return 'admin.billing.message.external.aws';
            }

            return 'admin.billing.message.external';
        }

        if (paymentMethodExists) {
            return 'admin.billing.message.paidTier';
        }

        return 'admin.billing.message.freeTier';
    }, [externalPaymentMethod, marketPlaceProvider, paymentMethodExists]);

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
