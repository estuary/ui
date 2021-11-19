import { createAjv } from '@jsonforms/core';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import CloseIcon from '@mui/icons-material/Close';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import axios from 'axios';
import PaitentLoad from 'components/shared/PaitentLoad';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {};
function NewCaptureModal(
    props: PropTypes.InferProps<typeof NewCaptureModal.propTypes>
) {
    const handleDefaultsAjv = createAjv({ useDefaults: true });

    const initialSchemaState = {
        error: null,
        fetching: false,
        schema: null,
        image: null,
    };

    const formOptions = {
        restrict: true,
        showUnfocusedDescription: true,
    };

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sourceTypeParam = searchParams.get('sourcetype');

    useEffect(() => {
        if (sourceTypeParam !== null) {
            return fetchSchemaForForm(sourceTypeParam);
        }
    }, [sourceTypeParam]);

    const [sourceType] = useState(sourceTypeParam ? sourceTypeParam : '');
    const [sourceName, setSourceName] = useState('');
    const [currentSchema, setCurrentSchema] = useState(initialSchemaState);
    const [newCaptureFormData, setNewCaptureFormData] = useState({});
    const [newCaptureFormErrors, setNewCaptureFormErrors] = useState([]);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState(null);

    const fetchSchemaForForm = (key: any) => {
        setShowValidation(false);
        setNewCaptureFormData({});
        setNewCaptureFormErrors([]);
        axios.get(`http://localhost:3001/source/${key}`).then(
            (response) => {
                setCurrentSchema({
                    ...initialSchemaState,
                    schema: response.data.specification.spec
                        .connectionSpecification,
                    image: response.data.details.image,
                });
                setSaveEnabled(true);
            },
            (error) => {
                setCurrentSchema({
                    ...initialSchemaState,
                    error: error.response
                        ? error.response.data.message
                        : error.message,
                });
                setSaveEnabled(false);
            }
        );
    };

    const handleClose = () => {
        setCurrentSchema(initialSchemaState);
        navigate('..'); //This is assuming this is a child of the /captures route.
    };

    const handleTest = (event: any) => {
        event.preventDefault();
        if (newCaptureFormErrors.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: newCaptureFormData,
                image: currentSchema.image,
                name: sourceName,
                type: sourceTypeParam,
            };
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/capture', formSubmitData)
                .then((response) => {
                    console.log('Capture Creation Done', response.data);
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                });
        }
    };

    const getSourceDetails = async (key: string) => {
        const hasKey = Boolean(key && key.length > 0);
        setCurrentSchema({
            ...initialSchemaState,
            fetching: hasKey,
        });
        setSearchParams(hasKey ? { sourcetype: key } : {});
        setSaveEnabled(hasKey);
    };

    const formChanged = ({ data, errors }: { data: any; errors: any }) => {
        setNewCaptureFormData(data);
        setNewCaptureFormErrors(errors);
    };

    const handleNameChange = (event: any) => {
        setSourceName(event.target.value);
    };

    const jsonFormRendered = (() => {
        if (currentSchema.error !== null) {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {currentSchema.error}
                </Alert>
            );
        } else {
            if (currentSchema.schema !== null) {
                return (
                    <form id="newCaptureForm">
                        <JsonForms
                            schema={currentSchema.schema}
                            data={newCaptureFormData}
                            renderers={materialRenderers}
                            cells={materialCells}
                            config={formOptions}
                            readonly={formSubmitting}
                            ajv={handleDefaultsAjv}
                            validationMode={
                                showValidation
                                    ? 'ValidateAndShow'
                                    : 'ValidateAndHide'
                            }
                            onChange={formChanged}
                        />
                    </form>
                );
            } else {
                return null;
            }
        }
    })();

    return (
        <>
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
                        To get started please provide a unique name and the
                        source type of the Capture you want to create. Once
                        you've filled out the source details you can click "Test
                        Capture" down below to test the connection.
                    </DialogContentText>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            id="capture-name"
                            label="Name of capture"
                            variant="outlined"
                            value={sourceName}
                            onChange={handleNameChange}
                        />
                        <SourceTypeSelect
                            id="source-type-select"
                            sourceType={sourceType}
                            onSourceChange={getSourceDetails}
                        />
                    </Stack>
                    <Box sx={{ width: '100%' }}>
                        {formSubmitError ? (
                            <Alert severity="error">
                                <AlertTitle>Capture test failed</AlertTitle>
                                <Typography variant="subtitle1">
                                    {formSubmitError}
                                </Typography>
                            </Alert>
                        ) : null}

                        {currentSchema.fetching ? (
                            <PaitentLoad on={currentSchema.fetching} />
                        ) : (
                            jsonFormRendered
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} size="large" color="error">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTest}
                        disabled={!saveEnabled || currentSchema.fetching}
                        form="newCaptureForm"
                        size="large"
                        type="submit"
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        Test Capture
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default NewCaptureModal;
