import { Skeleton, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';

function PricingTierDetails() {
    const billingStoreHydrated = useBillingStore((state) => state.hydrated);
    const paymentMethodExists = useBillingStore(
        (state) => state.paymentMethodExists
    );

    const messageId = useMemo(
        () =>
            paymentMethodExists
                ? 'admin.billing.message.paidTier'
                : 'admin.billing.message.freeTier',
        [paymentMethodExists]
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
