import { useState } from 'react';

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

import AlertBox from 'src/components/shared/AlertBox';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface PaymentFormProps {
    onSuccess(id: string): Promise<void>;
    onError?(message: string): Promise<void> | void;
}

export const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const user = useUserStore((state) => state.user);
    const userDetails = useUserStore((state) => state.userDetails);
    const [error, setError] = useState('');
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLoadError = (formName: string) => {
        setLoadingError(
            'Unable to load the forms from Stripe. Try again and if the issue persists please contact support.'
        );
        logRocketEvent(CustomEvents.STRIPE_FORM_LOADING_FAILED, { formName });
    };

    const handleSubmit = async () => {
        if (!stripe || !elements || loading) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setError('');
        setLoading(true);
        elements.getElement('payment')?.update({ readOnly: true });
        try {
            const result = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: { email: userDetails?.email },
                    },
                    return_url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                },
                // Some payment methods redirect to authorize before returning to this page.
                redirect: 'if_required',
            });
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (result.error) {
                throw new Error(
                    result.error.message ??
                        'Unable to save the payment method. Please try again.'
                );
            }
            const method = result.setupIntent.payment_method;
            const id = typeof method === 'string' ? method : method?.id;
            if (!id) {
                throw new Error(
                    'Stripe did not return a payment method. Please try again.'
                );
            }
            await onSuccess(id);
        } catch (failure) {
            const message =
                failure instanceof Error
                    ? failure.message
                    : 'Unable to save the payment method. Please try again.';
            setError(message);
            await onError?.(message);
            elements.getElement('payment')?.update({ readOnly: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DialogContent sx={{ overflowY: 'scroll' }}>
                {loadingError ? (
                    <AlertBox short severity="error">
                        {loadingError}
                    </AlertBox>
                ) : null}
                <AddressElement
                    onLoadError={() => handleLoadError('address')}
                    options={{
                        mode: 'billing',
                        defaultValues: {
                            name: user?.user_metadata.full_name,
                        },
                        display: { name: 'organization' },
                    }}
                />
                <PaymentElement
                    onLoadError={() => handleLoadError('payment')}
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
                    disabled={Boolean(
                        !stripe || !elements || loading || loadingError
                    )}
                >
                    {loading ? <CircularProgress size={15} /> : 'Submit'}
                </Button>
            </DialogActions>
        </>
    );
};
