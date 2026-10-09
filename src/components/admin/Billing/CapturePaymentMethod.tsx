import type { BillingContact } from 'src/utils/billing-contact-utils';

import { useCallback, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import {
    AddressElement,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';

import {
    billingAddressOptions,
    STRIPE_LOAD_ERROR,
} from 'src/components/admin/Billing/stripe';
import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    formatAddress,
    toStripeAddress,
} from 'src/utils/billing-contact-utils';

export interface PaymentFormProps {
    // The saved billing contact supplies the payment method's billing details
    // unless the user enters a different address for this payment method.
    contact: BillingContact | undefined;
    onSuccess?(id?: string): Promise<void> | void;
    onError?(msg: string): Promise<void> | void;
}

export const PaymentForm = ({
    contact,
    onSuccess,
    onError,
}: PaymentFormProps) => {
    const theme = useTheme();
    const stripe = useStripe();
    const elements = useElements();

    const [useDifferentAddress, setUseDifferentAddress] = useState(false);
    const [error, setError] = useState('');
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const contactName = contact?.name?.trim() ?? '';
    const contactEmail = contact?.email?.trim() ?? '';
    const contactAddress = formatAddress(contact?.address);

    const addressOptions = billingAddressOptions(contactName, {
        country: contact?.address?.country?.trim() ?? '',
    });

    const onLoadError = (formName: 'payment' | 'address') => () => {
        setLoadingError(STRIPE_LOAD_ERROR);
        logRocketEvent(CustomEvents.STRIPE_FORM_LOADING_FAILED, { formName });
    };

    const handleSubmit = useCallback(async () => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setLoading(true);
        try {
            let billingDetails = {
                name: contactName,
                email: contactEmail,
                address: toStripeAddress(contact?.address),
            };

            if (useDifferentAddress) {
                const addressElement = elements.getElement('address');
                if (!addressElement) {
                    return;
                }
                // getValue marks any fields Stripe still needs.
                const { complete, value } = await addressElement.getValue();
                if (!complete) {
                    return;
                }
                billingDetails = {
                    ...billingDetails,
                    name: value.name.trim(),
                    address: {
                        ...value.address,
                        line2: value.address.line2 ?? '',
                    },
                };
            }

            elements.getElement('payment')?.update({ readOnly: true });
            const result = await stripe.confirmSetup({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    payment_method_data: {
                        billing_details: billingDetails,
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
    }, [
        contact?.address,
        contactEmail,
        contactName,
        elements,
        onError,
        onSuccess,
        stripe,
        useDifferentAddress,
    ]);

    return (
        <>
            <DialogContent sx={{ overflowY: 'scroll' }}>
                <Stack spacing={2}>
                    {loadingError ? (
                        <AlertBox short severity="error">
                            {loadingError}
                        </AlertBox>
                    ) : null}

                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <Typography variant="body2">
                                Billing address
                            </Typography>
                            {useDifferentAddress ? (
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Not used for this payment method
                                </Typography>
                            ) : null}
                        </Stack>
                        <Box
                            sx={{
                                px: 1.75,
                                py: 1.5,
                                borderRadius: 3,
                                bgcolor: 'action.hover',
                                opacity: useDifferentAddress ? 0.5 : 1,
                                transition: theme.transitions.create('opacity'),
                            }}
                        >
                            <Typography>{contactName}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                {contactAddress}
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={useDifferentAddress}
                                    disabled={loading}
                                    onChange={(_event, checked) =>
                                        setUseDifferentAddress(checked)
                                    }
                                />
                            }
                            label="Use a different billing address"
                        />
                    </Stack>

                    {useDifferentAddress ? (
                        <Stack
                            spacing={1.5}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                            >
                                Applies to this payment method only. Your
                                billing contact won&apos;t change.
                            </Typography>
                            <AddressElement
                                options={addressOptions}
                                onLoadError={onLoadError('address')}
                            />
                        </Stack>
                    ) : null}

                    <PaymentElement
                        onLoadError={onLoadError('payment')}
                        options={{
                            // Billing details come from the contact or the
                            // address above, and are passed on confirm.
                            fields: {
                                billingDetails: {
                                    name: 'never',
                                    email: 'never',
                                    address: 'never',
                                },
                            },
                            readOnly: loading,
                        }}
                    />
                </Stack>
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
