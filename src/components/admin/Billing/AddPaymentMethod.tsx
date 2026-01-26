import type { Stripe } from '@stripe/stripe-js';

import { Box, Dialog, DialogTitle } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { setTenantPrimaryPaymentMethod } from 'src/api/billing';
import { PaymentForm } from 'src/components/admin/Billing/CapturePaymentMethod';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { fireGtmEvent } from 'src/services/gtm';

interface Props {
    show: boolean;
    setupIntentSecret: string;
    setOpen: (val: boolean) => void;
    onSuccess: () => void;
    stripePromise: Promise<Stripe | null>;
    tenant: string;
}

function AddPaymentMethod({
    onSuccess,
    show,
    setupIntentSecret,
    setOpen,
    stripePromise,
    tenant,
}: Props) {
    const postHog = usePostHog();

    const enable =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

    return (
        <>
            <Box>
                <SafeLoadingButton
                    loadingPosition="start"
                    disabled={!enable}
                    loading={setupIntentSecret === INTENT_SECRET_LOADING}
                    onClick={() => setOpen(true)}
                    startIcon={<Plus style={{ fontSize: 15 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="contained"
                >
                    <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
                </SafeLoadingButton>
            </Box>

            <Dialog
                maxWidth="sm"
                fullWidth
                sx={{ padding: 2 }}
                open={show}
                onClose={() => setOpen(false)}
                data-private
            >
                <DialogTitle>
                    <FormattedMessage id="admin.billing.addPaymentMethods.title" />
                </DialogTitle>
                {enable ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: setupIntentSecret,
                            loader: 'auto',
                        }}
                    >
                        {!tenant ? null : (
                            <PaymentForm
                                onSuccess={async (id) => {
                                    if (id) {
                                        await setTenantPrimaryPaymentMethod(
                                            tenant,
                                            id
                                        );

                                        fireGtmEvent('Payment_Entered', {
                                            tenant,
                                        });

                                        postHog.capture('Payment_Entered', {
                                            tenant,
                                        });
                                    }
                                    setOpen(false);
                                    onSuccess();
                                }}
                                onError={console.log}
                            />
                        )}
                    </Elements>
                ) : null}
            </Dialog>
        </>
    );
}

export default AddPaymentMethod;
