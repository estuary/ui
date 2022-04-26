import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Logs from 'components/Logs';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    open: boolean;
    token: string | null;
    title: string;
    defaultMessage?: string;
    actionComponent: ReactNode;
}

const logHeight = 200;

function LogDialog({ open, token, defaultMessage, actionComponent }: Props) {
    return (
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby="logs-dialog-title"
        >
            <DialogTitle id="logs-dialog-title">
                <FormattedMessage id="materializationCreation.save.inProgress" />
            </DialogTitle>

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
