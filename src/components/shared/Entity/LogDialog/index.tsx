import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

import LogDialogContent from './Content';
import { LogDialogProps } from './types';

import { useFormStateStore_message } from 'src/stores/FormState/hooks';

const TITLE_ID = 'logs-dialog-title';

function LogDialog({ open, token, actionComponent, title }: LogDialogProps) {
    const { key, severity } = useFormStateStore_message();

    return (
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby={TITLE_ID}
            sx={{
                minWidth: (theme) => theme.breakpoints.values.sm,
            }}
        >
            <DialogTitle id={TITLE_ID}>{title}</DialogTitle>

            <DialogContent>
                <LogDialogContent
                    spinnerMessageId={key}
                    severity={severity}
                    token={token}
                />
            </DialogContent>

            <DialogActions
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {actionComponent}
            </DialogActions>
        </Dialog>
    );
}

export default LogDialog;
