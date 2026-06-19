import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

interface Props {
    open: boolean;
    onClose: () => void;
    // Runs the delete; the dialog shows a spinner until it settles.
    onConfirm: () => Promise<void>;
}

export function DeletePaymentMethodDialog({ open, onClose, onConfirm }: Props) {
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
            <DialogTitle>Delete payment method?</DialogTitle>

            <DialogContent>
                <DialogContentText>
                    This payment method will be removed from your account. This
                    action cannot be undone.
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={processing}>
                    Cancel
                </Button>

                <Button
                    onClick={handleConfirm}
                    loading={processing}
                    variant="outlined"
                    color="error"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
