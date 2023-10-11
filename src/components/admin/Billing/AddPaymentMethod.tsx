import { LoadingButton } from '@mui/lab';
import { Box, Dialog, DialogTitle } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { setTenantPrimaryPaymentMethod } from 'api/billing';
import { PaymentForm } from 'components/admin/Billing/CapturePaymentMethod';
import { Plus } from 'iconoir-react';

import { FormattedMessage } from 'react-intl';
import { INTENT_SECRET_ERROR, INTENT_SECRET_LOADING } from './shared';

interface Props {
    show: boolean;
    setupIntentSecret: string;
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
    const enableButton =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

    return (
        <>
            <Box>
                <LoadingButton
                    loadingPosition="start"
                    disabled={!enableButton}
                    loading={setupIntentSecret === INTENT_SECRET_LOADING}
                    onClick={() => setOpen(true)}
                    startIcon={<Plus style={{ fontSize: 15 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="contained"
                >
                    <span>
                        <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
                    </span>
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
                {enableButton ? (
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
