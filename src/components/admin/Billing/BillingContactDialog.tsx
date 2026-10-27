import type { SxProps, Theme } from '@mui/material';
import type { BillingContact } from 'src/utils/billing-contact-utils';

import { useState } from 'react';
import useConstant from 'use-constant';

import {
    Autocomplete,
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
import { uniqBy } from 'lodash';
import { useMutation } from 'urql';

import { SET_BILLING_CONTACT } from 'src/api/gql/billing';
import {
    billingAddressOptions,
    getStripe,
    STRIPE_LOAD_ERROR,
    stripeFieldBackgroundDark,
    useStripeAppearance,
} from 'src/components/admin/Billing/stripe';
import { useStripeLoadError } from 'src/components/admin/Billing/useStripeLoadError';
import AlertBox from 'src/components/shared/AlertBox';
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
    // `continue` comes before adding a payment method.
    mode: 'edit' | 'continue';
    onClose: () => void;
    onSaved: () => void;
}

type BillingContactFormProps = Omit<BillingContactDialogProps, 'open'>;

// Splits typed or pasted text like "ap@acme.co, pay@acme.co" into addresses.
const splitEmails = (text: string) => text.split(/[\s,;]+/).filter(Boolean);

const uniqueEmails = (emails: string[]) =>
    uniqBy(emails, (email) => email.toLowerCase());

// Match the Address Element's labels and inputs, including the multi-email field.
const emailFieldSx: SxProps<Theme> = (theme) => {
    const isDark = theme.palette.mode === 'dark';
    const color = isDark ? '#fff' : '#30313d';

    return {
        '& .MuiInputLabel-root': {
            'position': 'static',
            'transform': 'none',
            'alignSelf': 'flex-start',
            'maxWidth': '100%',
            'mb': '4px',
            color,
            'fontSize': '0.93rem',
            'lineHeight': 1.15,
            '&.Mui-focused': { color },
            '&.Mui-error': { color: theme.palette.error.main },
        },
        '& .MuiOutlinedInput-root': {
            color,
            'backgroundColor': isDark ? stripeFieldBackgroundDark : '#fff',
            'borderRadius': '6px',
            'fontSize': '16px',
            'lineHeight': 1.15,
            'padding': '12px',
            'border': isDark ? 'none' : '1px solid #e6e6e6',
            'boxShadow': isDark
                ? 'none'
                : '0 1px 1px rgba(0,0,0,0.03), 0 3px 6px rgba(0,0,0,0.02)',
            '& fieldset': {
                display: 'none',
            },
            '&.Mui-focused': {
                outline: `2px solid ${theme.palette.primary.main}`,
            },
            '&.Mui-error': {
                outline: `2px solid ${theme.palette.error.main}`,
            },
            '& .MuiOutlinedInput-input': {
                height: 'auto',
                padding: 0,
            },
            '&.MuiAutocomplete-inputRoot': {
                'minHeight': isDark ? '42.4px' : '44.4px',
                'padding': '8px 12px',
                'gap': '4px',
                '& .MuiAutocomplete-tag': { margin: 0 },
            },
        },
        '& .MuiFormHelperText-root': { mx: 0 },
    };
};

export function BillingContactDialog({
    open,
    ...formProps
}: BillingContactDialogProps) {
    const appearance = useStripeAppearance();

    return (
        // No onClose: Escape or a click outside would discard the entered contact, so only Cancel closes it.
        <Dialog open={open} maxWidth="sm" fullWidth data-private>
            <Elements
                stripe={getStripe()}
                options={{ appearance, loader: 'auto' }}
            >
                <BillingContactForm {...formProps} />
            </Elements>
        </Dialog>
    );
}

function BillingContactForm({
    tenant,
    contact,
    mode,
    onClose,
    onSaved,
}: BillingContactFormProps) {
    const elements = useElements();
    const [, setBillingContact] = useMutation(SET_BILLING_CONTACT);
    const [saving, setSaving] = useState(false);

    const [email, setEmail] = useState(contact?.emails[0] ?? '');
    const [additionalEmails, setAdditionalEmails] = useState(
        contact?.emails.slice(1) ?? []
    );
    const [additionalInput, setAdditionalInput] = useState('');
    const [showEmailError, setShowEmailError] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { loadError, onLoadError } = useStripeLoadError();

    const emailError = showEmailError ? validateBillingEmail(email) : null;

    // Text not yet turned into a chip is saved too.
    const pendingEmails = splitEmails(additionalInput);
    const emails = uniqueEmails(
        [email.trim(), ...additionalEmails, ...pendingEmails].filter(Boolean)
    );
    const additionalProblem = pendingEmails.some(validateBillingEmail)
        ? 'Enter valid emails, like ap@company.com'
        : null;
    const additionalError = showEmailError ? additionalProblem : null;

    // Stripe applies option changes, and saving updates the contact while the
    // dialog closes, so keep the options it opened with.
    const addressOptions = useConstant(() =>
        billingAddressOptions(
            contact?.name ?? '',
            toStripeAddress(contact?.address)
        )
    );

    const save = async () => {
        setSaveError(null);
        setShowEmailError(true);
        // Saving disables the button, so a second click can't save twice.
        setSaving(true);
        try {
            const addressElement = elements?.getElement('address');
            const address = await addressElement?.getValue();
            if (
                !address?.complete ||
                validateBillingEmail(email) ||
                additionalProblem
            ) {
                return;
            }

            const result = await setBillingContact({
                tenant,
                name: address.value.name.trim(),
                emails,
                address: fromStripeAddress(address.value.address),
            });
            if (result.error) {
                setSaveError(
                    result.error.graphQLErrors[0]?.message ??
                        'Your entries are still here. Try again in a moment.'
                );
                return;
            }

            onSaved();
        } finally {
            setSaving(false);
        }
    };

    const status = getContactStatus(contact);
    const subtitle =
        mode === 'continue'
            ? `${status === 'missing' ? 'Add' : 'Finish'} your billing contact before adding a payment method. It appears on invoices and receipts.`
            : `Shown on invoices and receipts for ${tenant}.`;

    return (
        <>
            <DialogTitle component="div">
                <Typography variant="h6" component="h2">
                    Billing contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {subtitle}
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
                        onLoadError={() => onLoadError('billingContact')}
                    />

                    <TextField
                        variant="outlined"
                        sx={emailFieldSx}
                        slotProps={{
                            inputLabel: { shrink: true },
                        }}
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

                    <Autocomplete
                        size="small"
                        multiple
                        freeSolo
                        options={[]}
                        value={additionalEmails}
                        inputValue={additionalInput}
                        disabled={saving}
                        onInputChange={(_event, value) =>
                            setAdditionalInput(value)
                        }
                        // Valid addresses become chips. Invalid ones stay in the text box to fix.
                        onChange={(_event, values) => {
                            const entered = values.flatMap(splitEmails);
                            const invalid =
                                entered.filter(validateBillingEmail);
                            setAdditionalEmails(
                                uniqueEmails(
                                    entered.filter(
                                        (value) => !validateBillingEmail(value)
                                    )
                                )
                            );
                            setAdditionalInput(invalid.join(', '));
                            if (invalid.length > 0) {
                                setShowEmailError(true);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                sx={emailFieldSx}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                                label="Additional billing emails"
                                error={Boolean(additionalError)}
                                helperText={
                                    additionalError ??
                                    'Invoices also go to these addresses. Press Enter after each one.'
                                }
                            />
                        )}
                    />
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
                    disabled={loadError || !elements}
                >
                    {saving
                        ? 'Saving…'
                        : mode === 'continue'
                          ? 'Save and continue'
                          : 'Save'}
                </Button>
            </DialogActions>
        </>
    );
}
