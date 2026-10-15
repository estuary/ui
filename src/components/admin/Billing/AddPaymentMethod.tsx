import type { Stripe } from '@stripe/stripe-js';

import { useState } from 'react';

import { Box, Button, Dialog, DialogTitle, useTheme } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';

import { PaymentForm } from 'src/components/admin/Billing/CapturePaymentMethod';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import { stripePaymentFormFieldBackgroundDark } from 'src/context/Theme';
import { fireGtmEvent } from 'src/services/gtm';

interface Props {
    // The add-payment route opens the form on arrival.
    autoOpen: boolean;
    setupIntentSecret: string;
    onAdded: (id?: string) => Promise<void>;
    stripePromise: Promise<Stripe | null>;
    tenant: string;
}

function AddPaymentMethod({
    autoOpen,
    onAdded,
    setupIntentSecret,
    stripePromise,
    tenant,
}: Props) {
    const [show, setOpen] = useState(autoOpen);
    const postHog = usePostHog();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const flatField = { border: 'none', boxShadow: 'none' };

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
                                            borderColor:
                                                theme.palette.primary.main,
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
