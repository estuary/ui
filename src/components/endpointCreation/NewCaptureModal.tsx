import { createAjv } from '@jsonforms/core';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import Editor from '@monaco-editor/react';
import CloseIcon from '@mui/icons-material/Close';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import axios from 'axios';
import PaitentLoad from 'components/shared/PaitentLoad';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
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

    const editorRef = useRef(null);
    function handleEditorDidMount(editor: any) {
        editorRef.current = editor;
        console.log('handle 1');
        const handler = editor.onDidChangeModelDecorations((_: any) => {
            console.log('handle 2');
            handler.dispose();
            editor
                .getAction('editor.action.formatDocument')
                .run()
                .then(() =>
                    editor.updateOptions({
                        readOnly: true,
                        domReadOnly: true,
                    })
                );
        });
    }

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sourceTypeParam = searchParams.get('sourcetype');

    useEffect(() => {
        if (sourceTypeParam !== null) {
            fetchSchemaForForm(sourceTypeParam);
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
    const [catalogResponse, setCatalogResponse] = useState({} as any);

    const [activeStep, setActiveStep] = useState(0);

    const fetchSchemaForForm = (key: any) => {
        setShowValidation(false);
        setNewCaptureFormData({});
        setNewCaptureFormErrors([]);
        setActiveStep(1);
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
                setActiveStep(0);
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
            setSaveEnabled(false);
            setActiveStep(2);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/capture', formSubmitData)
                .then((response) => {
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                    setCatalogResponse(response.data);
                    setSaveEnabled(true);
                    setActiveStep(3);
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                    setSaveEnabled(true);
                    setActiveStep(1);
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

    const handleDelete = () => {
        alert('Delete? You sure?');
    };

    /*
    const handleApply = (event: any) => {
        event.preventDefault();
        if (newCaptureFormErrors.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: catalogResponse.data,
                type: sourceTypeParam,
            };
            setSaveEnabled(false);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/catalog/apply', formSubmitData)
                .then((response) => {
                    console.log('Catalog Applied', response.data);
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                    setCatalogResponse({});
                    handleClose();
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                    setSaveEnabled(true);
                    setActiveStep(1);
                });
        }
    };
    */

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
                sx={{
                    '.MuiDialog-container': {
                        alignItems: 'flex-start',
                    },
                }}
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
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step key={0}>
                            <StepLabel>Name &amp; Source Type</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <DialogContentText></DialogContentText>
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
                            </StepContent>
                        </Step>
                        <Step key={1}>
                            <StepLabel>Configuration</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    {formSubmitError ? (
                                        <Alert severity="error">
                                            <AlertTitle>
                                                Capture test failed
                                            </AlertTitle>
                                            <Typography variant="subtitle1">
                                                {formSubmitError}
                                            </Typography>
                                        </Alert>
                                    ) : null}

                                    {currentSchema.fetching ? (
                                        <PaitentLoad
                                            on={currentSchema.fetching}
                                        />
                                    ) : (
                                        jsonFormRendered
                                    )}
                                </Box>
                            </StepContent>
                        </Step>
                        <Step key={2}>
                            <StepLabel>Test</StepLabel>
                            <StepContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <CircularProgress />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ml: 2,
                                        }}
                                    >
                                        Testing configuration...
                                    </Typography>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step key={3}>
                            <StepLabel>Review &amp; Save</StepLabel>
                            <StepContent>
                                <Paper variant="outlined">
                                    <Editor
                                        height="350px"
                                        defaultLanguage="json"
                                        theme={
                                            theme.palette.mode === 'light'
                                                ? 'vs'
                                                : 'vs-dark'
                                        }
                                        defaultValue={JSON.stringify(
                                            catalogResponse.data
                                        )}
                                        onMount={handleEditorDidMount}
                                    />
                                </Paper>
                                <Typography variant="caption" color="success">
                                    location: {catalogResponse.path}
                                </Typography>
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>

                <DialogActions>
                    {activeStep > 2 ? (
                        <>
                            <Button
                                onClick={handleDelete}
                                size="large"
                                color="error"
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={handleClose}
                                disabled={!saveEnabled}
                                size="large"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleClose}
                                size="large"
                                color="error"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleTest}
                                disabled={
                                    !saveEnabled || currentSchema.fetching
                                }
                                form="newCaptureForm"
                                size="large"
                                type="submit"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                Test Capture
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default NewCaptureModal;
