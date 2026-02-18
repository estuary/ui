import { useCallback, useEffect, useRef, useState } from 'react';

import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    Typography,
} from '@mui/material';

import {
    AddressElement,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

export interface PaymentFormProps {
    onSuccess?(id?: string): Promise<void> | void;
    onError?(msg: string): Promise<void> | void;
}

export const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
    const intl = useIntl();

    const stripe = useStripe();
    const elements = useElements();

    const [user, userDetails] = useUserStore(
        useShallow((state) => [state.user, state.userDetails])
    );

    const setupEvents = useRef(false);
    const [error, setError] = useState('');
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle errors when stripe is loading in the forms
    useEffect(() => {
        if (setupEvents.current || !elements) {
            return;
        }

        // Try to fetch botht the elements we're gonna need to make sure load
        const addressElement = elements.getElement('address');
        const paymentElement = elements.getElement('payment');
        if (!addressElement || !paymentElement) {
            return;
        }

        // Wire up handlers
        paymentElement.on('loaderror', () => {
            setLoadingError(
                intl.formatMessage({
                    id: 'admin.billing.addPaymentMethods.stripeLoadError',
                })
            );

            logRocketEvent(CustomEvents.STRIPE_FORM_LOADING_FAILED, {
                formName: 'payment',
            });
        });
        addressElement.on('loaderror', () => {
            setLoadingError(
                intl.formatMessage({
                    id: 'admin.billing.addPaymentMethods.stripeLoadError',
                })
            );

            logRocketEvent(CustomEvents.STRIPE_FORM_LOADING_FAILED, {
                formName: 'address',
            });
        });

        // Set so we only do this once
        setupEvents.current = true;
    }, [elements, intl]);

    const handleSubmit = useCallback(async () => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setLoading(true);
        elements.getElement('payment')?.update({ readOnly: true });
        try {
            const result = await stripe.confirmSetup({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            email: userDetails?.email,
                        },
                    },
                    return_url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                },
                redirect: 'if_required',
            });

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (result.error) {
                if (result.error.message) {
                    setError(result.error.message);
                }
                // Show error to your customer (for example, payment details incomplete)
                await onError?.(
                    result.error.message ??
                        intl.formatMessage({ id: 'common.missingError' })
                );
                elements.getElement('payment')?.update({ readOnly: false });
            } else {
                // Your customer will be redirected to your `return_url`. For some payment
                // methods like iDEAL, your customer will be redirected to an intermediate
                // site first to authorize the payment, then redirected to the `return_url`.
                await onSuccess?.(
                    result.setupIntent.payment_method?.toString()
                );
            }
        } finally {
            setLoading(false);
        }
    }, [elements, intl, onError, onSuccess, stripe, userDetails?.email]);

    return (
        <>
            <DialogContent sx={{ overflowY: 'scroll' }}>
                {loadingError ? (
                    <AlertBox short severity="error">
                        {loadingError}
                    </AlertBox>
                ) : null}
                <AddressElement
                    options={{
                        mode: 'billing',
                        defaultValues: {
                            name: user?.user_metadata.full_name,
                        },
                        display: { name: 'organization' },
                    }}
                />
                <PaymentElement
                    options={{
                        fields: {
                            billingDetails: {
                                email: 'never',
                            },
                        },
                        readOnly: loading,
                        defaultValues: {
                            billingDetails: {
                                name: user?.user_metadata.full_name,
                            },
                        },
                    }}
                />
            </DialogContent>
            <DialogActions>
                {error ? (
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'red',
                            flex: 1,
                            textAlign: 'center',
                            fontWeight: 'bold',
                        }}
                    >
                        {error}
                    </Typography>
                ) : null}
                <Button
                    onClick={handleSubmit}
                    disabled={Boolean(loading || loadingError)}
                >
                    {loading ? <CircularProgress size={15} /> : 'Submit'}
                </Button>
            </DialogActions>
        </>
    );
};
