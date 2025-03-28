import { ReactNode } from 'react';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

import AlertBox from '../AlertBox';

const ARIA_DESC_ID = '-dialog-description';
const ARIA_LABEL_ID = '-dialog-title';

interface Props {
    body: ReactNode;
    cta: ReactNode;
    name: string;
    dialogTitle: ReactNode;
    bodyTitle: ReactNode;
}

function ErrorDialog({ name, dialogTitle, bodyTitle, body, cta }: Props) {
    const labelledBy = `${name}${ARIA_LABEL_ID}`;
    const describedby = `${name}${ARIA_DESC_ID}`;

    return (
        <Dialog
            open
            aria-labelledby={labelledBy}
            aria-describedby={describedby}
            sx={{
                minWidth: 300,
            }}
        >
            <DialogTitle id={labelledBy}>{dialogTitle}</DialogTitle>
            <DialogContent>
                <AlertBox short severity="info" title={bodyTitle}>
                    <DialogContentText id={describedby} component="div">
                        {body}
                    </DialogContentText>
                </AlertBox>
            </DialogContent>
            <DialogActions>{cta}</DialogActions>
        </Dialog>
    );
}

export default ErrorDialog;
