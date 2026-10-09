import type { StripeAddressElement } from '@stripe/stripe-js';
import type { BillingContact } from 'src/utils/billing-contact-utils';

import { useState } from 'react';
import useConstant from 'use-constant';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { AddressElement, Elements, useElements } from '@stripe/react-stripe-js';
import { useMutation } from 'urql';

import { SET_BILLING_CONTACT } from 'src/api/gql/billing';
import {
    billingAddressOptions,
    getStripe,
    STRIPE_LOAD_ERROR,
    useStripeAppearance,
} from 'src/components/admin/Billing/stripe';
import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    fromStripeAddress,
    getContactStatus,
    toStripeAddress,
    validateBillingEmail,
} from 'src/utils/billing-contact-utils';

interface BillingContactDialogProps {
    open: boolean;
    tenant: string;
    contact: BillingContact | undefined;
    // Notes that existing payment methods keep their billing address.
    hasPaymentMethods?: boolean;
    onClose: () => void;
    onSaved: () => void;
}

type BillingContactFormProps = Omit<BillingContactDialogProps, 'open'> & {
    saving: boolean;
    setSaving: (saving: boolean) => void;
};

export function BillingContactDialog({
    open,
    ...formProps
}: BillingContactDialogProps) {
    const appearance = useStripeAppearance();
    const [saving, setSaving] = useState(false);

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : formProps.onClose}
            maxWidth="sm"
            fullWidth
            data-private
        >
            <Elements
                stripe={getStripe()}
                options={{ appearance, loader: 'auto' }}
            >
                <BillingContactForm
                    {...formProps}
                    saving={saving}
                    setSaving={setSaving}
                />
            </Elements>
        </Dialog>
    );
}

function BillingContactForm({
    tenant,
    contact,
    hasPaymentMethods,
    saving,
    setSaving,
    onClose,
    onSaved,
}: BillingContactFormProps) {
    const elements = useElements();
    const [, setBillingContact] = useMutation(SET_BILLING_CONTACT);

    const status = getContactStatus(contact);
    const [email, setEmail] = useState(contact?.email ?? '');
    // A partial contact opens with its missing fields flagged. Everything
    // else is checked on save.
    const [showEmailError, setShowEmailError] = useState(
        status === 'incomplete' && !contact?.email?.trim()
    );
    const [saveError, setSaveError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState(false);

    const emailError = showEmailError ? validateBillingEmail(email) : null;

    // Stripe applies option changes, and saving updates the contact while the
    // dialog closes, so keep the options it opened with.
    const addressOptions = useConstant(() =>
        billingAddressOptions(
            contact?.name ?? '',
            toStripeAddress(contact?.address)
        )
    );

    const flagMissing = (element: StripeAddressElement) => {
        if (status === 'incomplete') {
            // getValue validates and marks the fields Stripe requires.
            void element.getValue();
        }
    };

    const save = async () => {
        setSaveError(null);
        setShowEmailError(true);
        // Saving disables the button, so a second click can't save twice.
        setSaving(true);
        try {
            const addressElement = elements?.getElement('address');
            const address = await addressElement?.getValue();
            if (!address?.complete || validateBillingEmail(email)) {
                return;
            }

            const result = await setBillingContact({
                tenant,
                name: address.value.name.trim(),
                email: email.trim(),
                address: fromStripeAddress(address.value.address),
            });
            if (result.error || !result.data?.setBillingContact) {
                setSaveError(
                    result.error?.graphQLErrors[0]?.message ??
                        'Your entries are still here. Try again in a moment.'
                );
                return;
            }

            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <DialogTitle component="div">
                <Typography variant="h6" component="h2">
                    Billing contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Shown on invoices and receipts for {tenant}.
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {saveError ? (
                        <AlertBox
                            short
                            severity="error"
                            title="Couldn't save billing contact"
                        >
                            {saveError}
                        </AlertBox>
                    ) : null}

                    {loadError ? (
                        <AlertBox short severity="error">
                            {STRIPE_LOAD_ERROR}
                        </AlertBox>
                    ) : null}

                    <AddressElement
                        options={addressOptions}
                        onReady={flagMissing}
                        onLoadError={() => {
                            setLoadError(true);
                            logRocketEvent(
                                CustomEvents.STRIPE_FORM_LOADING_FAILED,
                                { formName: 'billingContact' }
                            );
                        }}
                    />

                    <TextField
                        label="Billing email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        disabled={saving}
                        onChange={(event) => setEmail(event.target.value)}
                        error={Boolean(emailError)}
                        helperText={
                            emailError ??
                            'Invoices and billing notices go to this address.'
                        }
                    />

                    {hasPaymentMethods ? (
                        <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                        >
                            Existing payment methods keep the billing address
                            they were added with.
                        </Typography>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="text" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={() => void save()}
                    loading={saving}
                    loadingPosition="start"
                    disabled={loadError}
                >
                    {saving ? 'Saving…' : 'Save'}
                </Button>
            </DialogActions>
        </>
    );
}
