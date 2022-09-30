import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Logs from 'components/logs';
import { logDialogBackground } from 'context/Theme';
import { ReactNode } from 'react';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    open: boolean;
    token: string | null;
    title: ReactNode;
    actionComponent: ReactNode;
}

const TITLE_ID = 'logs-dialog-title';

function LogDialog({ open, token, actionComponent, title }: Props) {
    return (
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby={TITLE_ID}
            sx={{
                'minWidth': (theme) => theme.breakpoints.values.sm,
                '& .MuiDialog-paper': {
                    backgroundColor: (theme) =>
                        logDialogBackground[theme.palette.mode],
                    borderRadius: 5,
                },
            }}
        >
            <DialogTitle id={TITLE_ID}>{title}</DialogTitle>

            <DialogContent>
                <ErrorBoundryWrapper>
                    <Logs token={token} height={350} />
                </ErrorBoundryWrapper>
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
