import { Skeleton, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useBilling_hydrated,
    useBilling_paymentMethodExists,
} from 'stores/Billing/hooks';

function PricingTierDetails() {
    const billingStoreHydrated = useBilling_hydrated();
    const paymentMethodExists = useBilling_paymentMethodExists();

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
