import { useMemo } from 'react';

import { Skeleton, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useTenantUsesExternalPayment } from 'src/context/fetcher/TenantBillingDetails';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';

function PricingTierDetails() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const [externalPaymentMethod, marketPlaceProvider] =
        useTenantUsesExternalPayment(selectedTenant);

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

    if (typeof paymentMethodExists !== 'boolean') {
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
