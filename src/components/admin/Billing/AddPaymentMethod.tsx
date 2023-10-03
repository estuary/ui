import { LoadingButton } from '@mui/lab';
import { Box, Dialog, DialogTitle } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { setTenantPrimaryPaymentMethod } from 'api/billing';
import { PaymentForm } from 'components/admin/Billing/CapturePaymentMethod';

import { FormattedMessage } from 'react-intl';

interface Props {
    show: boolean;
    setupIntentSecret: string | null;
    setOpen: (val: boolean) => void;
    onSuccess: () => void;
    stripePromise: Promise<Stripe | null>;
    tenant: string;
}

function AddPaymentMethod({
    onSuccess,
    show,
    setupIntentSecret,
    setOpen,
    stripePromise,
    tenant,
}: Props) {
    return (
        <>
            <Box>
                <LoadingButton
                    variant="contained"
                    disabled={!setupIntentSecret}
                    loading={!setupIntentSecret}
                    onClick={() => setOpen(true)}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
                </LoadingButton>
            </Box>

            <Dialog
                maxWidth="sm"
                fullWidth
                sx={{ padding: 2 }}
                open={show}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>
                    <FormattedMessage id="admin.billing.addPaymentMethods.title" />
                </DialogTitle>
                {setupIntentSecret ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: setupIntentSecret,
                            loader: 'auto',
                        }}
                    >
                        {!tenant ? null : (
                            <PaymentForm
                                onSuccess={async (id) => {
                                    if (id) {
                                        await setTenantPrimaryPaymentMethod(
                                            tenant,
                                            id
                                        );
                                    }
                                    setOpen(false);
                                    onSuccess();
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
