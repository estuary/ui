import type { SxProps, Theme } from '@mui/material';
import type { BillingContact } from 'src/utils/billing-contact-utils';

import { useEffect, useId, useRef, useState } from 'react';
import useConstant from 'use-constant';

import {
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { AddressElement, Elements, useElements } from '@stripe/react-stripe-js';
import { partition, uniqBy } from 'lodash';
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
import { PrimaryList } from 'src/components/shared/PrimaryList';
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
        '& .MuiOutlinedInput-root': {
            color,
            'backgroundColor': isDark ? stripeFieldBackgroundDark : '#fff',
            'borderRadius': 3,
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
    const emailInputId = useId();
    const contentRef = useRef<HTMLDivElement>(null);
    const fieldsRef = useRef<HTMLDivElement>(null);
    const [, setBillingContact] = useMutation(SET_BILLING_CONTACT);
    const [saving, setSaving] = useState(false);

    const [emails, setEmails] = useState(() =>
        uniqueEmails(
            (contact?.emails ?? []).map((email) => email.trim()).filter(Boolean)
        )
    );
    const [emailInput, setEmailInput] = useState('');
    const [showEmailError, setShowEmailError] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { loadError, onLoadError } = useStripeLoadError();
    const previousEmailCount = useRef(emails.length);

    useEffect(() => {
        const addedEmails = emails.length > previousEmailCount.current;
        previousEmailCount.current = emails.length;
        const content = contentRef.current;
        const fields = fieldsRef.current;
        if (!addedEmails || !content || !fields) return;

        const scrollToBottom = () => {
            content.scrollTop = content.scrollHeight;
        };
        scrollToBottom();
        // Follow the added rows as they expand
        const observer = new ResizeObserver(scrollToBottom);
        observer.observe(fields);
        return () => observer.disconnect();
    }, [emails.length]);

    const duplicateEmail = showEmailError
        ? splitEmails(emailInput).find((value) =>
              emails.some(
                  (email) => email.toLowerCase() === value.toLowerCase()
              )
          )
        : undefined;
    const emailError = showEmailError
        ? duplicateEmail
            ? `${duplicateEmail} is already in the list`
            : emailInput || emails.some(validateBillingEmail)
              ? 'Enter valid emails, like ap@company.com'
              : emails.length === 0
                ? 'Enter a billing email'
                : null
        : null;

    // Stripe applies option changes, and saving updates the contact while the
    // dialog closes, so keep the options it opened with.
    const addressOptions = useConstant(() =>
        billingAddressOptions(
            contact?.name ?? '',
            toStripeAddress(contact?.address)
        )
    );

    // Enter and blur add new valid addresses; rejected text stays available to fix.
    const addEmails = () => {
        const entered = splitEmails(emailInput);
        if (entered.length === 0) {
            setEmailInput('');
            return;
        }
        setShowEmailError(true);
        const seen = new Set(emails.map((email) => email.toLowerCase()));
        const [invalid, valid] = partition(entered, (email) => {
            const key = email.toLowerCase();
            if (validateBillingEmail(email) || seen.has(key)) return true;
            seen.add(key);
            return false;
        });
        setEmails((current) => uniqueEmails([...current, ...valid]));
        setEmailInput(invalid.join(', '));
    };

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
                emails.length === 0 ||
                emails.some(validateBillingEmail) ||
                emailInput
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
                <Stack spacing={1}>
                    <Stack>
                        <Typography variant="h6" component="h2">
                            Billing contact
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                        >
                            {subtitle}
                        </Typography>
                    </Stack>
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
                </Stack>
            </DialogTitle>

            <DialogContent ref={contentRef}>
                <Stack ref={fieldsRef} spacing={2} sx={{ pt: 1 }}>
                    <AddressElement
                        options={addressOptions}
                        onLoadError={() => onLoadError('billingContact')}
                    />
                    <Box sx={{ py: 2 }}>
                        <Divider />
                    </Box>

                    <Stack>
                        <Typography
                            component="label"
                            htmlFor={emailInputId}
                            sx={(theme) => ({
                                mb: 1,
                                color:
                                    theme.palette.mode === 'dark'
                                        ? '#fff'
                                        : '#30313d',
                                fontSize: '0.93rem',
                                fontWeight: 400,
                                lineHeight: 1.15,
                            })}
                        >
                            Billing emails
                        </Typography>

                        <Collapse in={emails.length > 0} unmountOnExit>
                            <PrimaryList
                                sx={{ pb: 1 }}
                                items={emails}
                                onChange={(nextEmails) => {
                                    setEmails(nextEmails);
                                    setShowEmailError(false);
                                }}
                                disabled={saving}
                                renderLabel={(email) => email}
                                renderBody={(_, isPrimary) => (
                                    <Typography
                                        variant="body2"
                                        color="text.disabled"
                                        sx={{ overflowWrap: 'anywhere' }}
                                    >
                                        {isPrimary
                                            ? 'Receives invoices & billing notices'
                                            : ''}
                                    </Typography>
                                )}
                            />
                        </Collapse>
                        <TextField
                            size="small"
                            variant="outlined"
                            sx={emailFieldSx}
                            id={emailInputId}
                            placeholder={
                                emails.length === 0
                                    ? 'Press enter to add more addresses'
                                    : 'Add additional emails...'
                            }
                            value={emailInput}
                            disabled={saving}
                            onChange={(event) => {
                                setEmailInput(event.target.value);
                                setShowEmailError(false);
                            }}
                            onBlur={addEmails}
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' &&
                                    !event.nativeEvent.isComposing
                                ) {
                                    event.preventDefault();
                                    addEmails();
                                }
                            }}
                            error={Boolean(emailError)}
                            helperText={emailError ?? ' '}
                        />
                    </Stack>
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
