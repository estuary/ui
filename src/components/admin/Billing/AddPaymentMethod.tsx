import type { Stripe } from '@stripe/stripe-js';

import { Box, Button, Dialog, DialogTitle, useTheme } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Elements } from '@stripe/react-stripe-js';
import { Plus } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useMountedState } from 'react-use';
import { useMutation } from 'urql';

import { SET_BILLING_PAYMENT_METHOD } from 'src/api/gql/billing';
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
    onRefresh: () => void;
    onComplete: (error?: string) => void;
    stripePromise: Promise<Stripe | null>;
    tenant: string;
}

function AddPaymentMethod({
    onRefresh,
    onComplete,
    show,
    setupIntentSecret,
    setOpen,
    stripePromise,
    tenant,
}: Props) {
    const intl = useIntl();
    const isMounted = useMountedState();
    const [, setPrimary] = useMutation(SET_BILLING_PAYMENT_METHOD);
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
                    {intl.formatMessage({
                        id: 'admin.billing.paymentMethods.cta.addPaymentMethod',
                    })}
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
                <DialogTitle>
                    {intl.formatMessage({
                        id: 'admin.billing.addPaymentMethods.title',
                    })}
                </DialogTitle>
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
