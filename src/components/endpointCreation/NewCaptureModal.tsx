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

enum Steps {
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

    // Form data state
    const [state, dispatch] = useReducer(
        newCaptureReducer,
        NewCaptureDetailsInitState
    );
    const providerState = {
        state,
        dispatch,
    };

    // Form props
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] = useState({} as any);
    const [activeStep, setActiveStep] = useState<Steps>(Steps.DETAILS_AND_SPEC);

    // Form Event Handlers
    const handlers = {
        close: () => {
            navigate('..'); //This is assuming this is a child of the /captures route.
        },

        delete: () => {
            alert('Delete? You sure?');
        },

        save: (event: any) => {
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
            link.setAttribute(
                'download',
                `${state.details.data.image}.flow.yaml`
            );

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            window.setTimeout(() => {
                // Clean up and remove the link
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                handlers.close();
            }, 0);
        },

        test: (event: any) => {
            event.preventDefault();

            if (
                state.details.errors!.length > 0 ||
                state.spec.errors!.length > 0
            ) {
                setShowValidation(true);
            } else {
                const formSubmitData = {
                    config: state.spec.data,
                    captureName: state.details.data.name,
                    sourceImage: state.details.data.image,
                };
                setFormSubmitting(true);
                setFormSubmitError(null);
                setActiveStep(Steps.WAITING_FOR_DISCOVER);
                axios
                    .post(
                        'http://localhost:3001/capture/test/fake',
                        formSubmitData
                    )
                    .then((response) => {
                        setFormSubmitting(false);
                        setCatalogResponse(response.data);
                        setActiveStep(Steps.REVIEW_SCHEMA_IN_EDITOR);
                    })
                    .catch((error) => {
                        if (error.response) {
                            setFormSubmitError(error.response.data);
                        } else {
                            setFormSubmitError(error.message);
                        }
                        setFormSubmitting(false);
                        setActiveStep(Steps.DETAILS_AND_SPEC);
                    });
            }
        },
    };

    return (
        <>
            <Dialog
                open
                onClose={handlers.close}
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
                        onClick={handlers.close}
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
                                onClick={handlers.delete}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id="cta.delete" />
                            </Button>
                            <Button
                                onClick={handlers.save}
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
                                onClick={handlers.close}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id="cta.cancel" />
                            </Button>
                            <Button
                                onClick={handlers.test}
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
