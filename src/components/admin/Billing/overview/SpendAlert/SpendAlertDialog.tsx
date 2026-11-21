import type { FormEvent } from 'react';
import type { SpendAlertWriteResult } from 'src/hooks/billing/useSpendAlert';

import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import {
    formatCharges,
    parseAmountCents,
} from 'src/components/admin/Billing/overview/SpendAlert/shared';
import { captionColor } from 'src/components/admin/Billing/shared/CardHeader';
import AlertBox from 'src/components/shared/AlertBox';

interface SpendAlertDialogProps {
    open: boolean;
    tenant: string;
    amountCents: number | null;
    enabled: boolean;
    chargesCents: number | null;
    hasRecipients?: boolean;
    onClose: () => void;
    save: (amountCents: number) => Promise<SpendAlertWriteResult>;
    disable: () => Promise<SpendAlertWriteResult>;
}

type SpendAlertFormProps = Omit<SpendAlertDialogProps, 'open'>;

export function SpendAlertDialog({
    open,
    onClose,
    ...formProps
}: SpendAlertDialogProps) {
    return (
        // The dialog unmounts the form when it closes, so each opening starts
        // from the saved amount.
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <SpendAlertForm onClose={onClose} {...formProps} />
        </Dialog>
    );
}

function SpendAlertForm({
    tenant,
    amountCents,
    enabled,
    chargesCents,
    hasRecipients,
    onClose,
    save,
    disable,
}: SpendAlertFormProps) {
    const [draft, setDraft] = useState(
        amountCents === null ? '' : (amountCents / 100).toFixed(2)
    );
    const [invalid, setInvalid] = useState(false);
    const [pending, setPending] = useState<'save' | 'disable' | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const run = async (
        action: 'save' | 'disable',
        write: () => Promise<SpendAlertWriteResult>
    ) => {
        setSaveError(null);
        setPending(action);
        try {
            const { error } = await write();
            if (error) {
                setSaveError(
                    error.graphQLErrors[0]?.message ?? 'Try again in a moment.'
                );
                return;
            }

            onClose();
        } finally {
            setPending(null);
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const cents = parseAmountCents(draft);
        if (cents === null) {
            setInvalid(true);
            return;
        }

        void run('save', () => save(cents));
    };

    return (
        <Box component="form" noValidate onSubmit={submit}>
            <DialogTitle>
                {enabled ? 'Edit spend alert' : 'Set up spend alert'}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5}>
                    <Typography variant="body2" sx={{ color: captionColor }}>
                        Everyone subscribed to alerts for {tenant} gets an email
                        when this month&apos;s charges reach this amount.
                    </Typography>

                    {saveError ? (
                        <AlertBox
                            short
                            severity="error"
                            title="Couldn't save the spend alert"
                        >
                            {saveError}
                        </AlertBox>
                    ) : null}

                    <TextField
                        label="Amount ($)"
                        value={draft}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setInvalid(false);
                        }}
                        error={invalid}
                        helperText={
                            invalid
                                ? 'Enter an amount above $0.'
                                : chargesCents === null
                                  ? undefined
                                  : `This month so far: ${formatCharges(chargesCents)}.`
                        }
                        disabled={pending !== null}
                        fullWidth
                        autoFocus
                        slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                    />

                    {hasRecipients === false ? (
                        <AlertBox short severity="warning">
                            No one gets {tenant} spend alerts yet. Add
                            recipients in Settings.
                        </AlertBox>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                {enabled ? (
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => void run('disable', disable)}
                        loading={pending === 'disable'}
                        disabled={pending !== null}
                    >
                        Disable
                    </Button>
                ) : null}

                <Box sx={{ flex: 1 }} />

                <Button
                    variant="text"
                    onClick={onClose}
                    disabled={pending !== null}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    loading={pending === 'save'}
                    disabled={pending !== null}
                >
                    Save
                </Button>
            </DialogActions>
        </Box>
    );
}
