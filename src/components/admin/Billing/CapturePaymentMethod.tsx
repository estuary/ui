import { useCallback, useState } from 'react';

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
import { Auth } from '@supabase/ui';

import { getUserDetails } from 'services/supabase';

export interface PaymentFormProps {
    onSuccess?(id?: string): Promise<void> | void;
    onError?(msg: string): Promise<void> | void;
}

export const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const { user } = Auth.useUser();
    const { email } = getUserDetails(user);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                            email,
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
                await onError?.(result.error.message ?? 'Something went wrong');
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
    }, [elements, email, onError, onSuccess, stripe]);

    return (
        <>
            <DialogContent sx={{ overflowY: 'scroll' }}>
                <AddressElement
                    options={{
                        mode: 'billing',
                        defaultValues: { name: user?.user_metadata.full_name },
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
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={15} /> : 'Submit'}
                </Button>
            </DialogActions>
        </>
    );
};
