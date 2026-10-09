import { Box, Button, Dialog, DialogTitle } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';
import { useMountedState } from 'react-use';
import { useMutation } from 'urql';

import { SET_BILLING_PAYMENT_METHOD } from 'src/api/gql/billing';
import { PaymentForm } from 'src/components/admin/Billing/CapturePaymentMethod';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import {
    getStripe,
    useStripeAppearance,
} from 'src/components/admin/Billing/stripe';
import { fireGtmEvent } from 'src/services/gtm';

interface Props {
    show: boolean;
    setupIntentSecret: string;
    setOpen: (val: boolean) => void;
    onRefresh: () => void;
    onComplete: (error?: string) => void;
    tenant: string;
}

function AddPaymentMethod({
    onRefresh,
    onComplete,
    show,
    setupIntentSecret,
    setOpen,
    tenant,
}: Props) {
    const isMounted = useMountedState();
    const [, setPrimary] = useMutation(SET_BILLING_PAYMENT_METHOD);
    const postHog = usePostHog();
    const appearance = useStripeAppearance();

    const enable =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

    return (
        <>
            <Box>
                <Button
                    loadingPosition="start"
                    disabled={!enable}
                    loading={setupIntentSecret === INTENT_SECRET_LOADING}
                    onClick={() => setOpen(true)}
                    startIcon={<Plus style={{ fontSize: 15 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="contained"
                >
                    Add Payment Method
                </Button>
            </Box>

            <Dialog
                maxWidth="sm"
                fullWidth
                sx={{ padding: 2 }}
                open={show}
                onClose={() => setOpen(false)}
                data-private
            >
                <DialogTitle>Add a payment method</DialogTitle>
                {enable ? (
                    <Elements
                        stripe={getStripe()}
                        options={{
                            clientSecret: setupIntentSecret,
                            loader: 'auto',
                            appearance,
                        }}
                    >
                        {!tenant ? null : (
                            <PaymentForm
                                onSuccess={async (id) => {
                                    if (!isMounted()) {
                                        onRefresh();
                                        return;
                                    }
                                    if (!id) {
                                        setOpen(false);
                                        onRefresh();
                                        onComplete();
                                        return;
                                    }
                                    const result = await setPrimary({
                                        tenant,
                                        paymentMethodId: id,
                                    });
                                    const failed =
                                        result.error ||
                                        !result.data?.setBillingPaymentMethod;
                                    if (!isMounted()) {
                                        if (failed) {
                                            onRefresh();
                                        }
                                        return;
                                    }
                                    if (!failed) {
                                        fireGtmEvent('Payment_Entered', {
                                            tenant,
                                        });
                                        postHog.capture('Payment_Entered', {
                                            tenant,
                                        });
                                    }
                                    setOpen(false);
                                    onComplete(
                                        failed
                                            ? `Your payment method was saved, but it could not be made primary. Please try Make Primary. ${result.error?.message ?? ''}`
                                            : undefined
                                    );
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
