import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Logs from 'components/logs';
import { ReactNode } from 'react';
import { useFormStateStore_message } from 'stores/FormState/hooks';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    open: boolean;
    token: string | null;
    title: ReactNode;
    actionComponent: ReactNode;
}

const TITLE_ID = 'logs-dialog-title';

function LogDialog({ open, token, actionComponent, title }: Props) {
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
                <ErrorBoundryWrapper>
                    <Logs
                        token={token}
                        height={350}
                        loadingLineSeverity={severity}
                        spinnerMessages={
                            key
                                ? {
                                      stoppedKey: key,
                                      runningKey: key,
                                  }
                                : undefined
                        }
                    />
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
