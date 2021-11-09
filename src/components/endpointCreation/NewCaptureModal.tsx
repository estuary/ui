import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
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
import PropTypes from 'prop-types';
import { useState } from 'react';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};
type NewCaptureModalProps = PropTypes.InferProps<
    typeof NewCaptureModal.propTypes
>;

function NewCaptureModal(props: NewCaptureModalProps) {
    const initialSchemaState = {
        error: null,
        schema: null,
    };
    const { open, setOpen } = props;

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [sourceType] = useState('');
    const [currentSchema, setCurrentSchema] = useState(initialSchemaState);
    const [newCaptureFormData, setNewCaptureFormData] = useState({});

    const handleClose = () => {
        setCurrentSchema(initialSchemaState);
        setOpen(false);
    };

    const jsonFormRendered = (() => {
        if (currentSchema.error !== null) {
            return currentSchema.error;
        } else {
            if (currentSchema.schema !== null) {
                return (
                    <JsonForms
                        schema={currentSchema.schema}
                        data={newCaptureFormData}
                        renderers={materialRenderers}
                        cells={materialCells}
                        onChange={({ data }) => setNewCaptureFormData(data)}
                    />
                );
            } else {
                return 'Please select a source type above to get started.';
            }
        }
    })();

    const getSourceDetails = async (key: string) => {
        setCurrentSchema(initialSchemaState);
        if (key !== '') {
            setCurrentSchema(initialSchemaState);
            fetch(`http://localhost:3001/source/details/${key}`)
                .then((response) => response.json())
                .then(
                    (result) => {
                        setCurrentSchema({
                            error: null,
                            schema: result,
                        });
                    },
                    (error) => {
                        setCurrentSchema({
                            schema: null,
                            error: error.message,
                        });
                    }
                );
        }
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
                <SourceTypeSelect
                    id="source-type-select"
                    type={sourceType}
                    onSourceChange={getSourceDetails}
                />
            </DialogContent>
            <DialogContent dividers>{jsonFormRendered}</DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewCaptureModal;
