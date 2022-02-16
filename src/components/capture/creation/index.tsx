import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
import NewCaptureDetails from './DetailsForm';
import NewCaptureError from './Error';
import { getInitialState, newCaptureReducer } from './Reducer';
import NewCaptureEditor from './SchemaEditor';
import NewCaptureSpecForm from './SpecForm';
import NewCaptureSpecFormHeader from './SpecFormHeader';

const FORM_ID = 'newCaptureForm';
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
    const [state, dispatch] = useReducer(newCaptureReducer, getInitialState());
    const { details, spec, links } = state;

    // const [specState, specDispatch] = useReducer(specReducer, specInit);

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
            link.setAttribute('download', `${details.data.name}.flow.yaml`);

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

            if (spec.errors!.length > 0 || details.errors!.length > 0) {
                setShowValidation(true);
            } else {
                setFormSubmitting(true);
                setFormSubmitError(null);
                setActiveStep(Steps.WAITING_FOR_DISCOVER);
                axios
                    .post(links.discovery, spec.data)
                    .then((response) => {
                        setCatalogResponse(response.data.data.attributes);
                        setActiveStep(Steps.REVIEW_SCHEMA_IN_EDITOR);
                    })
                    .catch((error) => {
                        if (error.errors) {
                            setFormSubmitError({
                                message: 'title',
                                errors: error.errors,
                            });
                        } else {
                            setFormSubmitError(error.message);
                        }
                        setActiveStep(Steps.DETAILS_AND_SPEC);
                    })
                    .finally(() => {
                        setFormSubmitting(false);
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
                        errors={[]}
                    />
                )}

                <DialogContent dividers>
                    {activeStep === Steps.DETAILS_AND_SPEC ? (
                        <ErrorBoundryWrapper>
                            <form id={FORM_ID}>
                                <NewCaptureDetails
                                    displayValidation={showValidation}
                                    readonly={formSubmitting}
                                    state={details}
                                    dispatch={dispatch}
                                />
                                <Paper
                                    sx={{ width: '100%' }}
                                    variant="outlined"
                                >
                                    <NewCaptureSpecFormHeader
                                        dispatch={dispatch}
                                        endpoint={links.connectorImage}
                                        docs={links.documentation}
                                    />
                                    <Divider />
                                    <NewCaptureSpecForm
                                        displayValidation={showValidation}
                                        readonly={formSubmitting}
                                        state={spec.data}
                                        dispatch={dispatch}
                                        endpoint={state.links.spec}
                                    />
                                </Paper>
                            </form>
                        </ErrorBoundryWrapper>
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
                                form={FORM_ID}
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
