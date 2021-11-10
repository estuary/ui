import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import PaitentLoad from 'components/shared/PaitentLoad';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {};
function NewCaptureModal(
    props: PropTypes.InferProps<typeof NewCaptureModal.propTypes>
) {
    const initialSchemaState = {
        error: null,
        fetching: false,
        schema: null,
    };

    const navigate = useNavigate();
    const params = useParams();

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [sourceType] = useState(params.sourceType ? params.sourceType : '');
    const [currentSchema, setCurrentSchema] = useState(initialSchemaState);
    const [newCaptureFormData, setNewCaptureFormData] = useState({});

    const fetchSchemaForForm = (key: string) => {
        fetch(`http://localhost:3001/source/details/${key}`)
            .then((response) => response.json())
            .then(
                (result) => {
                    setCurrentSchema({
                        error: null,
                        fetching: false,
                        schema: result,
                    });
                },
                (error) => {
                    setCurrentSchema({
                        schema: null,
                        fetching: false,
                        error: error.message,
                    });
                }
            );
    };

    const handleClose = () => {
        setCurrentSchema(initialSchemaState);

        //This is assuming this modal is opened as a child. This will blow up big time if that is not true.
        navigate('../');
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
                return null;
            }
        }
    })();

    const getSourceDetails = async (key: string) => {
        if (key === '') {
            setCurrentSchema(initialSchemaState);
        } else {
            setCurrentSchema({ ...initialSchemaState, fetching: true });
            fetchSchemaForForm(key);
        }
    };

    if (params.sourceType) {
        fetchSchemaForForm(params.sourceType);
    }

    return (
        <Dialog
            open
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
                    type of the Capture you want to create. Once you've filled
                    out the source details you can click save to test the
                    connection.
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
                <Divider />
                <Box sx={{ width: '100%' }}>
                    {currentSchema.fetching ? (
                        <PaitentLoad on={currentSchema.fetching} />
                    ) : (
                        jsonFormRendered
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose}>Save (and test)</Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewCaptureModal;
