import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import { ReactNode } from 'react';

interface Props {
    open: boolean;
    token: string | null;
    title: ReactNode;
    actionComponent: ReactNode;
}

const logHeight = 200;
const TITLE_ID = 'logs-dialog-title';

function LogDialog({ open, token, actionComponent, title }: Props) {
    return (
        <Dialog open={open} maxWidth="lg" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle id={TITLE_ID}>{title}</DialogTitle>

            <DialogContent
                sx={{
                    minHeight: logHeight + 25,
                }}
            >
                <ErrorLogs logToken={token} defaultOpen />
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
