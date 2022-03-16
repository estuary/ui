import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

export default function AlertDialog() {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Unsaved Changes</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    You have unsaved changes that will be lost. Are you sure you
                    want to close the modal?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>No - Stay</Button>
                <Button onClick={handleClose} autoFocus>
                    Yes - Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
