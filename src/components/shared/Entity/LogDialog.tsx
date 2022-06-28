import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import { slate } from 'context/Theme';
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
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby={TITLE_ID}
            sx={{
                '& .MuiDialog-paper': {
                    backgroundColor: (themes) =>
                        themes.palette.mode === 'dark' ? slate[800] : slate[25],
                    borderRadius: 5,
                    backgroundImage: (themes) =>
                        themes.palette.mode === 'dark'
                            ? 'linear-gradient(160deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.22) 75%, rgba(13, 43, 67, 0.18) 100%)'
                            : 'linear-gradient(160deg, rgba(246, 250, 255, 0.4) 0%, rgba(216, 233, 245, 0.4) 75%, rgba(172, 199, 220, 0.4) 100%)',
                },
            }}
        >
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
