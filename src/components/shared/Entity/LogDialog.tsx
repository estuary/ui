import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useTheme,
} from '@mui/material';
import Logs from 'components/logs';
import { slate } from 'context/Theme';
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
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby={TITLE_ID}
            sx={{
                'minWidth': (themes) => themes.breakpoints.values.sm,
                '& .MuiDialog-paper': {
                    backgroundColor:
                        theme.palette.mode === 'dark' ? slate[800] : slate[25],
                    borderRadius: 5,
                    backgroundImage:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(160deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.22) 75%, rgba(13, 43, 67, 0.18) 100%)'
                            : 'linear-gradient(160deg, rgba(246, 250, 255, 0.4) 0%, rgba(216, 233, 245, 0.4) 75%, rgba(172, 199, 220, 0.4) 100%)',
                },
                '& .MuiAccordionSummary-root': {
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? 'transparent'
                            : slate[50],
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
