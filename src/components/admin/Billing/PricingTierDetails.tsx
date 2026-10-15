import { useMemo } from 'react';

import { Skeleton, Typography } from '@mui/material';

import { useTenantUsesExternalPayment } from 'src/context/fetcher/TenantBillingDetails';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
import { useTenantStore } from 'src/stores/Tenant';

function PricingTierDetails() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const [externalPaymentMethod, marketPlaceProvider] =
        useTenantUsesExternalPayment(selectedTenant);

    const { billing, isLoading, error } = useBillingPaymentMethods(
        externalPaymentMethod ? '' : selectedTenant
    );
    const paymentMethodExists = Boolean(billing?.paymentMethods.length);

    const message = useMemo(() => {
        if (externalPaymentMethod) {
            if (marketPlaceProvider === 'gcp') {
                return 'GCP Marketplace';
            }

            if (marketPlaceProvider === 'aws') {
                return 'AWS Marketplace';
            }

            return ' ';
        }

        if (paymentMethodExists) {
            return 'Cloud tier';
        }

        return 'The free tier lets you try Estuary with up to 2 tasks and 10GB per month without entering a credit card. Usage beyond these limits automatically starts a 30 day free trial.';
    }, [externalPaymentMethod, marketPlaceProvider, paymentMethodExists]);

    if (!externalPaymentMethod && error) {
        return <Typography>Pricing information unavailable.</Typography>;
    }

    if (!externalPaymentMethod && isLoading) {
        return (
            <Skeleton>
                <Typography>{message}</Typography>
            </Skeleton>
        );
    } else {
        return <Typography>{message}</Typography>;
    }
}

export default PricingTierDetails;
