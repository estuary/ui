import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Logs from 'components/Logs';
import { ReactNode } from 'react';

interface Props {
    open: boolean;
    token: string | null;
    title: ReactNode;
    defaultMessage?: string;
    actionComponent: ReactNode;
}

const logHeight = 200;

function LogDialog({
    open,
    token,
    defaultMessage,
    actionComponent,
    title,
}: Props) {
    return (
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby="logs-dialog-title"
        >
            <DialogTitle id="logs-dialog-title">{title}</DialogTitle>
            <DialogContent
                sx={{
                    height: logHeight + 25,
                }}
            >
                <Logs
                    token={token}
                    defaultMessage={defaultMessage}
                    height={logHeight}
                />
            </DialogContent>
            <DialogActions>{actionComponent}</DialogActions>
        </Dialog>
    );
}

export default LogDialog;
