import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

import { useIntl } from 'react-intl';

interface Props {
    open: boolean;
    onClose: () => void;
    // Runs the delete; the dialog shows a spinner until it settles.
    onConfirm: () => Promise<void>;
}

export function DeletePaymentMethodDialog({ open, onClose, onConfirm }: Props) {
    const intl = useIntl();

    const [processing, setProcessing] = useState(false);

    const handleConfirm = async () => {
        setProcessing(true);

        try {
            await onConfirm();
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog
            open={open}
            // Don't let a backdrop/escape close cancel an in-flight delete.
            onClose={processing ? undefined : onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                {intl.formatMessage({
                    id: 'admin.billing.paymentMethods.delete.confirmation.title',
                })}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    {intl.formatMessage({
                        id: 'admin.billing.paymentMethods.delete.confirmation.message',
                    })}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={processing}>
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <Button
                    onClick={handleConfirm}
                    loading={processing}
                    variant="outlined"
                    color="error"
                >
                    {intl.formatMessage({ id: 'cta.delete' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
