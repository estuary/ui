import { Skeleton, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';

function PricingTierDetails() {
    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const [paymentMethodExists, externalPaymentMethod] = useBillingStore(
        (state) => [state.paymentMethodExists, state.externalPaymentMethod]
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
