import type { AdminBillingProps } from 'src/components/admin/Billing/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { loadStripe } from '@stripe/stripe-js';
import { FormattedMessage } from 'react-intl';

import { getSetupIntentSecret } from 'src/api/billing';
import AddPaymentMethod from 'src/components/admin/Billing/AddPaymentMethod';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import AlertBox from 'src/components/shared/AlertBox';
import PaymentMethodsTable from 'src/components/tables/PaymentMethods';
import { useTenantStore } from 'src/stores/Tenant';

const PaymentMethods = ({ showAddPayment }: AdminBillingProps) => {
    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''),
        []
    );

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [refreshCounter, setRefreshCounter] = useState(0);

    const [setupIntentSecret, setSetupIntentSecret] = useState(
        INTENT_SECRET_LOADING
    );
    const [newMethodOpen, setNewMethodOpen] = useState(showAddPayment ?? false);

    // These are two different iifes so this component loads just a _tiny bit_ faster
    useEffect(() => {
        void (async () => {
            if (selectedTenant) {
                const setupResponse =
                    await getSetupIntentSecret(selectedTenant);

                if (setupResponse.data?.intent_secret) {
                    setSetupIntentSecret(setupResponse.data.intent_secret);
                } else {
                    setSetupIntentSecret(INTENT_SECRET_ERROR);
                }
            }
        })();
    }, [selectedTenant, refreshCounter]);

    return (
        <Stack spacing={3}>
            {setupIntentSecret === INTENT_SECRET_ERROR ? (
                <AlertBox short severity="error">
                    <Typography component="div">
                        <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod.error" />
                    </Typography>
                </AlertBox>
            ) : null}

            <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1, justifyContent: 'space-between' }}
            >
                <Box>
                    <Typography
                        sx={{
                            mb: 1,
                            fontSize: 18,
                            fontWeight: '400',
                        }}
                    >
                        <FormattedMessage id="admin.billing.paymentMethods.header" />
                    </Typography>

                    {/* {serverErrored ? null : ( */}
                    <Typography>
                        <FormattedMessage id="admin.billing.paymentMethods.description" />
                    </Typography>
                    {/* )} */}
                </Box>

                {/* {serverErrored ? null : ( */}
                <AddPaymentMethod
                    show={newMethodOpen}
                    setOpen={setNewMethodOpen}
                    tenant={selectedTenant}
                    onSuccess={() => setRefreshCounter((r) => r + 1)}
                    stripePromise={stripePromise}
                    setupIntentSecret={setupIntentSecret}
                />
                {/* )} */}
            </Stack>

            <PaymentMethodsTable />
        </Stack>
    );
};

export default PaymentMethods;
