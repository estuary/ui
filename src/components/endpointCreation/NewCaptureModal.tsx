import { JsonForms } from '@jsonforms/react';
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import CloseIcon from '@mui/icons-material/Close';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import { CaptureSchema } from 'forms/CaptureSchema';
import { CaptureUISchema } from 'forms/CaptureUISchema';
import PropTypes from 'prop-types';
import React from 'react';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};
type NewCaptureModalProps = PropTypes.InferProps<
    typeof NewCaptureModal.propTypes
>;

function NewCaptureModal(props: NewCaptureModalProps) {
    const { open, setOpen } = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [newCaptureFormData, setNewCaptureFormData] = React.useState({});

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            scroll="paper"
            fullScreen={fullScreen}
            fullWidth={!fullScreen}
            maxWidth={'md'}
            aria-labelledby="new-capture-dialog-title"
        >
            <DialogTitle id="new-capture-dialog-title">
                New Capture
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        position: 'absolute',
                        right: 0,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    To get started please provide a unique name and the source
                    type of the Capture you want to create.
                </DialogContentText>
                <TextField
                    id="capture-name"
                    label="Name of capture"
                    variant="outlined"
                />
                <SourceTypeSelect id="source-type-select" />
            </DialogContent>
            <DialogContent dividers>
                <JsonForms
                    schema={CaptureSchema}
                    uischema={CaptureUISchema}
                    data={newCaptureFormData}
                    renderers={vanillaRenderers}
                    cells={vanillaCells}
                    onChange={({ data }) => setNewCaptureFormData(data)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewCaptureModal;
