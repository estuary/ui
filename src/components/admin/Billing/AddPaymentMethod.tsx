import { Box, Dialog, DialogTitle } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { setTenantPrimaryPaymentMethod } from 'api/billing';
import { PaymentForm } from 'components/admin/Billing/CapturePaymentMethod';
import SafeLoadingButton from 'components/SafeLoadingButton';
import { Plus } from 'iconoir-react';

import { FormattedMessage } from 'react-intl';
import { fireGtmEvent } from 'services/gtm';
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
    const enable =
        setupIntentSecret !== INTENT_SECRET_LOADING &&
        setupIntentSecret !== INTENT_SECRET_ERROR;

    return (
        <>
            <Box>
                <SafeLoadingButton
                    loadingPosition="start"
                    disabled={!enable}
                    loading={setupIntentSecret === INTENT_SECRET_LOADING}
                    onClick={() => setOpen(true)}
                    startIcon={<Plus style={{ fontSize: 15 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="contained"
                >
                    <FormattedMessage id="admin.billing.paymentMethods.cta.addPaymentMethod" />
                </SafeLoadingButton>
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
                    <FormattedMessage id="admin.billing.addPaymentMethods.title" />
                </DialogTitle>
                {enable ? (
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

                                        fireGtmEvent('Payment_Entered', {
                                            tenant,
                                        });
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
