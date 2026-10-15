import { useState } from 'react';

import { Box, Button, Dialog, DialogTitle } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';

import { BillingContactDialog } from 'src/components/admin/Billing/BillingContactDialog';
import { PaymentForm } from 'src/components/admin/Billing/CapturePaymentMethod';
import {
    getStripe,
    useStripeAppearance,
} from 'src/components/admin/Billing/stripe';
import { useBillingContact } from 'src/hooks/billing/useBillingContact';
import { fireGtmEvent } from 'src/services/gtm';
import { getContactStatus } from 'src/utils/billing-contact-utils';

interface Props {
    // The add-payment route starts adding a payment method on arrival.
    autoOpen: boolean;
    setupIntentSecret?: string;
    loading: boolean;
    onAdded: (id?: string) => Promise<void>;
    tenant: string;
}

function AddPaymentMethod({
    autoOpen,
    onAdded,
    loading,
    setupIntentSecret,
    tenant,
}: Props) {
    const [show, setOpen] = useState(autoOpen);
    const postHog = usePostHog();
    const appearance = useStripeAppearance();
    const { contact, isLoading: contactLoading } = useBillingContact(tenant);

    // Adding a payment method starts with the billing contact when it is
    // incomplete, once the contact loads.
    const ready = show && !contactLoading;
    const complete = getContactStatus(contact) === 'complete';
    const contactOpen = ready && !complete;
    const paymentOpen = ready && complete;

    return (
        <>
            <Box>
                <Button
                    loadingPosition="start"
                    disabled={!setupIntentSecret}
                    loading={loading}
                    onClick={() => setOpen(true)}
                    startIcon={<Plus style={{ fontSize: 15 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="contained"
                >
                    Add Payment Method
                </Button>
            </Box>

            <BillingContactDialog
                open={contactOpen}
                tenant={tenant}
                contact={contact}
                mode="continue"
                onClose={() => setOpen(false)}
                // Saving completes the contact, which opens the payment form.
                onSaved={() => undefined}
            />

            <Dialog
                maxWidth="sm"
                fullWidth
                sx={{ padding: 2 }}
                open={paymentOpen}
                onClose={() => setOpen(false)}
                data-private
            >
                <DialogTitle>Add a payment method</DialogTitle>
                {setupIntentSecret ? (
                    <Elements
                        stripe={getStripe()}
                        options={{
                            clientSecret: setupIntentSecret,
                            loader: 'auto',
                            appearance,
                        }}
                    >
                        <PaymentForm
                            contact={contact}
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
