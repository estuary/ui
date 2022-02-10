import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import axios from 'axios';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useReducer, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import NewCaptureContext from './NewCaptureContext';
import NewCaptureDetails from './NewCaptureDetails';
import NewCaptureEditor from './NewCaptureEditor';
import NewCaptureError from './NewCaptureError';
import {
    NewCaptureDetailsInitState,
    newCaptureReducer,
} from './NewCaptureReducer';
import NewCaptureSpecForm from './NewCaptureSpecForm';

export enum Steps {
    DETAILS_AND_SPEC,
    WAITING_FOR_DISCOVER,
    REVIEW_SCHEMA_IN_EDITOR,
}

function NewCaptureModal() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(
        newCaptureReducer,
        NewCaptureDetailsInitState
    );
    const providerState = {
        state,
        dispatch,
    };

    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] = useState({} as any);

    const [activeStep, setActiveStep] = useState<Steps>(Steps.DETAILS_AND_SPEC);

    const handleClose = () => {
        navigate('..'); //This is assuming this is a child of the /captures route.
    };

    const handleTest = (event: any) => {
        event.preventDefault();

        if (state.details.errors!.length > 0 || state.spec.errors!.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: state.spec.data,
                captureName: state.details.data.name,
                sourceImage: state.details.data.image,
            };
            setFormSubmitError(null);
            setActiveStep(Steps.WAITING_FOR_DISCOVER);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/capture/test/fake', formSubmitData)
                .then((response) => {
                    setFormSubmitting(false);
                    setCatalogResponse(response.data);
                    setActiveStep(Steps.REVIEW_SCHEMA_IN_EDITOR);
                })
                .catch((error) => {
                    errorResponseHandler(error);
                });
        }
    };

    const handleDelete = () => {
        alert('Delete? You sure?');
    };

    const errorResponseHandler = (error: any) => {
        if (error.response) {
            setFormSubmitError(error.response.data);
        } else {
            setFormSubmitError(error.message);
        }
        setFormSubmitting(false);
        setActiveStep(Steps.DETAILS_AND_SPEC);
    };

    const handleSave = (event: any) => {
        event.preventDefault();
        let catalogVal = '';

        if (editorRef && editorRef.current) {
            catalogVal = editorRef.current.getValue();
        }

        setFormSubmitting(true);

        // Create blob link to download
        const url = window.URL.createObjectURL(
            new Blob([catalogVal], {
                type: 'text/plain',
            })
        );

        // Make download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${state.details.data.image}.flow.yaml`);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        window.setTimeout(() => {
            // Clean up and remove the link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            handleClose();
        }, 0);
    };

    return (
        <>
            <Dialog
                open
                onClose={handleClose}
                scroll="paper"
                fullScreen={fullScreen}
                fullWidth={!fullScreen}
                maxWidth={'lg'}
                sx={{
                    '.MuiDialog-container': {
                        alignItems: 'flex-start',
                    },
                }}
                aria-labelledby="new-capture-dialog-title"
            >
                <DialogTitle id="new-capture-dialog-title">
                    <FormattedMessage id="captureCreation.heading" />
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

                {formSubmitError && (
                    <NewCaptureError
                        title={formSubmitError.message}
                        errors={formSubmitError.errors}
                    />
                )}

                <DialogContent dividers>
                    {activeStep === Steps.DETAILS_AND_SPEC ? (
                        <NewCaptureContext.Provider value={providerState}>
                            <NewCaptureDetails
                                readonly={formSubmitting}
                                displayValidation={showValidation}
                            />
                            <Paper sx={{ width: '100%' }} variant="outlined">
                                <ErrorBoundryWrapper>
                                    <NewCaptureSpecForm
                                        readonly={formSubmitting}
                                        displayValidation={showValidation}
                                    />
                                </ErrorBoundryWrapper>
                            </Paper>
                        </NewCaptureContext.Provider>
                    ) : null}
                    {activeStep === Steps.WAITING_FOR_DISCOVER ? (
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
                                <FormattedMessage id="captureCreation.config.testing" />
                            </Typography>
                        </Box>
                    ) : null}
                    {activeStep === Steps.REVIEW_SCHEMA_IN_EDITOR ? (
                        <NewCaptureEditor data={catalogResponse} />
                    ) : null}
                </DialogContent>

                <DialogActions>
                    {activeStep > Steps.WAITING_FOR_DISCOVER ? (
                        <>
                            <Button
                                onClick={handleDelete}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id="cta.delete" />
                            </Button>
                            <Button
                                onClick={handleSave}
                                size="large"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                <FormattedMessage id="cta.download" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleClose}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id="cta.cancel" />
                            </Button>
                            <Button
                                onClick={handleTest}
                                disabled={false}
                                form="newCaptureForm"
                                size="large"
                                type="submit"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                <FormattedMessage id="captureCreation.ctas.test.config" />
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default NewCaptureModal;
