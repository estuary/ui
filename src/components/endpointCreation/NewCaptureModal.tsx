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
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import axios from 'axios';
import ErrorBoundary from 'components/shared/ErrorBoundry';
import FormLoading from 'components/shared/FormLoading';
import { useSourceSchema } from 'hooks/useSourceSchema';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CaptureName from './CaptureName';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {};
function NewCaptureModal(
    props: PropTypes.InferProps<typeof NewCaptureModal.propTypes>
) {
    const handleDefaultsAjv = createAjv({ useDefaults: true });

    const formOptions = {
        restrict: true,
        showUnfocusedDescription: true,
    };

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    function handleEditorDidMount(
        editor: monacoEditor.editor.IStandaloneCodeEditor
    ) {
        editorRef.current = editor;
        const handler = editor.onDidChangeModelDecorations(() => {
            handler.dispose();
            editor.getAction('editor.action.formatDocument').run();
        });
    }

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const sourceTypeParam = searchParams.get('sourcetype');
    const { isFetching, schema, error, image } =
        useSourceSchema(sourceTypeParam);

    const [sourceName, setSourceName] = useState('');
    const [newCaptureFormData, setNewCaptureFormData] = useState({});
    const [newCaptureFormErrors, setNewCaptureFormErrors] = useState([]);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState(null);
    const [catalogResponse, setCatalogResponse] = useState({} as any);

    const [activeStep, setActiveStep] = useState(0);

    const handleClose = () => {
        navigate('..'); //This is assuming this is a child of the /captures route.
    };

    const handleTest = (event: any) => {
        event.preventDefault();
        if (newCaptureFormErrors.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: newCaptureFormData,
                image: image,
                name: sourceName,
                type: sourceTypeParam,
            };
            setSaveEnabled(false);
            setActiveStep(1);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/capture/test', formSubmitData)
                .then((response) => {
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                    setCatalogResponse(response.data);
                    setSaveEnabled(true);
                    setActiveStep(2);
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                    setSaveEnabled(true);
                    setActiveStep(0);
                });
        }
    };

    const getSourceDetails = async (key: string) => {
        const hasKey = Boolean(key && key.length > 0);
        setSearchParams(hasKey ? { sourcetype: key } : {});
        setSaveEnabled(hasKey);
    };

    const formChanged = ({ data, errors }: { data: any; errors: any }) => {
        setNewCaptureFormData(data);
        setNewCaptureFormErrors(errors);
    };

    const handleNameChange = (value: string) => {
        setSourceName(value);
    };

    const handleDelete = () => {
        alert('Delete? You sure?');
    };

    const handleSave = (event: any) => {
        event.preventDefault();
        const formSubmitData = {
            config: {},
            image: image,
            name: sourceName,
            type: sourceTypeParam,
        };
        let catalogVal = '';

        if (editorRef && editorRef.current) {
            catalogVal = editorRef.current.getValue();
        }
        formSubmitData.config = JSON.parse(catalogVal);

        setSaveEnabled(false);
        setActiveStep(1);
        setFormSubmitting(true);
        axios
            .post('http://localhost:3001/capture/save', formSubmitData)
            .then((response: any) => {
                alert('Saved ' + response.data.path);
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
                setActiveStep(0);
            });
    };

    const jsonFormRendered = (() => {
        if (error !== null) {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            );
        } else if (schema !== null) {
            return (
                <ErrorBoundary>
                    <JsonForms
                        schema={schema}
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
                </ErrorBoundary>
            );
        } else {
            return null;
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

                {formSubmitError ? (
                    <Box sx={{ width: '100%' }}>
                        <Alert severity="error">
                            <AlertTitle>Capture test failed</AlertTitle>
                            <Typography variant="subtitle1">
                                {formSubmitError}
                            </Typography>
                        </Alert>
                    </Box>
                ) : null}

                <DialogContent dividers>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step key={0}>
                            <StepLabel>Config</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <DialogContentText>
                                    To get started please provide a unique name
                                    and the source type of the Capture you want
                                    to create. Once you've filled out the source
                                    details you can click "Test Capture" down
                                    below to test the connection.
                                </DialogContentText>

                                <form id="newCaptureForm">
                                    <Stack direction="row" spacing={2}>
                                        <CaptureName
                                            id="capture-name"
                                            onValueChange={handleNameChange}
                                        />
                                        <SourceTypeSelect
                                            id="source-type-select"
                                            sourceType={sourceTypeParam}
                                            onSourceChange={getSourceDetails}
                                        />
                                    </Stack>

                                    <Box sx={{ width: '100%' }}>
                                        {isFetching ? (
                                            <FormLoading />
                                        ) : (
                                            jsonFormRendered
                                        )}
                                    </Box>
                                </form>
                            </StepContent>
                        </Step>
                        <Step key={1}>
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
                        <Step key={2}>
                            <StepLabel>Review</StepLabel>
                            <StepContent>
                                <DialogContentText>
                                    Look over the catalog configuration that was
                                    generated. Once you click Save it will write
                                    the contents to the file listed below. If
                                    you want to edit anything you can do that
                                    directly in the editor.
                                </DialogContentText>
                                <Paper variant="outlined">
                                    {catalogResponse &&
                                    catalogResponse.data &&
                                    catalogResponse.data.data ? (
                                        <Editor
                                            height="350px"
                                            defaultLanguage="json"
                                            theme={
                                                theme.palette.mode === 'light'
                                                    ? 'vs'
                                                    : 'vs-dark'
                                            }
                                            defaultValue={JSON.stringify(
                                                catalogResponse.data.data
                                            )}
                                            onMount={handleEditorDidMount}
                                        />
                                    ) : (
                                        <>Loading...</>
                                    )}
                                </Paper>
                                <Typography variant="caption" color="success">
                                    Will be saved at : {catalogResponse.path}
                                </Typography>
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>

                <DialogActions>
                    {activeStep > 1 ? (
                        <>
                            <Button
                                onClick={handleDelete}
                                size="large"
                                color="error"
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={handleSave}
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
                                disabled={!saveEnabled || isFetching}
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
