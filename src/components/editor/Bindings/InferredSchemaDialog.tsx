import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function InferredSchemaDialog({ open }: Props) {
    return (
        <Dialog open={open}>
            <DialogTitle />

            <DialogContent>
                <DialogActions>
                    <Button>Select</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
}

export default InferredSchemaDialog;
