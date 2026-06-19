import type { Stripe } from '@stripe/stripe-js';

import { Dialog, DialogTitle, useTheme } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';

import { PaymentForm } from 'src/components/admin/Billing/CapturePaymentMethod';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import { stripePaymentFormFieldBackgroundDark } from 'src/context/Theme';
import { fireGtmEvent } from 'src/services/gtm';

interface Props {
    show: boolean;
    setupIntentSecret: string;
    setOpen: (val: boolean) => void;
    // Called with the newly added method's id once Stripe confirms it, so the
    // parent can promote it to primary and re-fetch the list.
    onSuccess: (paymentMethodId?: string | null) => void | Promise<void>;
    stripePromise: Promise<Stripe | null>;
    tenant: string;
}

export function AddPaymentMethodDialog({
    onSuccess,
    show,
    setupIntentSecret,
    setOpen,
    stripePromise,
    tenant,
}: Props) {
    const postHog = usePostHog();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const flatField = { border: 'none', boxShadow: 'none' };

    const enable =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

    return (
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
                    stripe={stripePromise}
                    options={{
                        clientSecret: setupIntentSecret,
                        loader: 'auto',
                        appearance: {
                            theme: isDark ? 'night' : 'stripe',
                            variables: {
                                colorPrimary: theme.palette.primary.main,
                                fontFamily: theme.typography.fontFamily,
                                borderRadius: `6px`,
                                focusBoxShadow: 'none',
                                focusOutline: 'none',
                            },
                            ...(isDark && {
                                rules: {
                                    '.Input': {
                                        ...flatField,
                                        backgroundColor:
                                            stripePaymentFormFieldBackgroundDark,
                                    },
                                    '.Tab': {
                                        ...flatField,
                                        backgroundColor:
                                            stripePaymentFormFieldBackgroundDark,
                                    },
                                    '.Tab--focused': {
                                        borderColor: theme.palette.primary.main,
                                    },
                                    '.Block': {
                                        ...flatField,
                                        padding: '14px',
                                        backgroundColor:
                                            stripePaymentFormFieldBackgroundDark,
                                    },
                                    '.PickerItem': {
                                        ...flatField,
                                        backgroundColor:
                                            stripePaymentFormFieldBackgroundDark,
                                    },
                                },
                            }),
                        },
                    }}
                >
                    {!tenant ? null : (
                        <PaymentForm
                            onSuccess={async (id) => {
                                if (id) {
                                    fireGtmEvent('Payment_Entered', {
                                        tenant,
                                    });

                                    postHog.capture('Payment_Entered', {
                                        tenant,
                                    });
                                }
                                setOpen(false);
                                await onSuccess(id);
                            }}
                            onError={console.log}
                        />
                    )}
                </Elements>
            ) : null}
        </Dialog>
    );
}
