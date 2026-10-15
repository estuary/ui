import { useState } from 'react';

import { Box, Button, Dialog, DialogTitle } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';

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
    // The add-payment route opens the form on arrival.
    autoOpen: boolean;
    setupIntentSecret: string;
    onAdded: (id?: string) => Promise<void>;
    tenant: string;
}

function AddPaymentMethod({
    autoOpen,
    onAdded,
    setupIntentSecret,
    tenant,
}: Props) {
    const [show, setOpen] = useState(autoOpen);
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
                        <PaymentForm
                            onSuccess={async (id) => {
                                await onAdded(id);
                                if (id) {
                                    fireGtmEvent('Payment_Entered', {
                                        tenant,
                                    });
                                    postHog.capture('Payment_Entered', {
                                        tenant,
                                    });
                                }
                                setOpen(false);
                            }}
                            onError={console.log}
                        />
                    </Elements>
                ) : null}
            </Dialog>
        </>
    );
}

export default AddPaymentMethod;
