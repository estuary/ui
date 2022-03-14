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
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import {
    DiscoveredCatalog,
    discoveredCatalogEndpoint,
} from 'endpoints/discoveredCatalog';
import { MouseEvent, useReducer, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import useChangeSetStore, { CaptureState, Entity } from 'stores/ChangeSetStore';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';
import useSchemaEditorStore, {
    SchemaEditorState,
} from 'stores/SchemaEditorStore';
import NewCaptureDetails from './DetailsForm';
import NewCaptureError from './Error';
import { getInitialState, newCaptureReducer } from './Reducer';
import NewCaptureEditor from './SchemaEditor';
import NewCaptureSpecForm from './SpecForm';
import NewCaptureSpecFormHeader from './SpecFormHeader';

const FORM_ID = 'newCaptureForm';
enum Steps {
    DETAILS_AND_SPEC = 'Getting basic connection details',
    WAITING_FOR_DISCOVER = 'Waiting for discovery call to server',
    REVIEW_SCHEMA_IN_EDITOR = 'Allow custom to edit YAML',
}

const selectors = {
    addCapture: (state: CaptureState) => state.addCapture,
    removeSchema: (state: SchemaEditorState) => state.removeSchema,
    schema: (state: SchemaEditorState) => state.schema,
    showNotification: (state: NotificationState) => state.showNotification,
};

function NewCaptureModal() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    // Schema editor store
    const schemaFromEditor = useSchemaEditorStore(selectors.schema);
    const removeSchema = useSchemaEditorStore(selectors.removeSchema);

    // Change set store
    const addCaptureToChangeSet = useChangeSetStore(selectors.addCapture);

    // Notification store
    const showNotification = useNotificationStore(selectors.showNotification);

    // Form data state
    const [state, dispatch] = useReducer(newCaptureReducer, getInitialState());
    const { details, spec, links } = state;

    // Form props
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] =
        useState<DiscoveredCatalog | null>(null);
    const [activeStep, setActiveStep] = useState<Steps>(Steps.DETAILS_AND_SPEC);

    // Form Event Handlers
    const handlers = {
        addToChangeSet: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const catalogNamespace: string = details.data.name;

            const capture: Entity = {
                metadata: {
                    catalogNamespace,
                    changeType: 'New Entity',
                    entityType: 'Capture',
                    name: catalogNamespace.substring(
                        catalogNamespace.lastIndexOf('/') + 1,
                        catalogNamespace.length
                    ),
                },
                schema: schemaFromEditor || catalogResponse,
            };

            const notification: Notification = {
                description: 'Your changes can be viewed on the Builds page.',
                severity: 'success',
                title: 'New Capture Created',
            };

            addCaptureToChangeSet(catalogNamespace, capture);
            showNotification(notification);

            setFormSubmitting(true);

            handlers.close();
        },

        close: () => {
            if (schemaFromEditor) {
                removeSchema();
            }

            navigate('..'); //This is assuming this is a child of the /captures route.
        },

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO - this was to make TS/Ling happy
            if (details.errors) {
                detailHasErrors = details.errors.length > 0;
            }

            if (spec.errors) {
                specHasErrors = spec.errors.length > 0;
            }

            if (detailHasErrors || specHasErrors) {
                setShowValidation(true);
            } else {
                setFormSubmitting(true);
                setFormSubmitError(null);
                setActiveStep(Steps.WAITING_FOR_DISCOVER);

                discoveredCatalogEndpoint
                    .create(links.discovered_catalog, {
                        name: details.data.name,
                        config: spec.data,
                    })
                    .then((response) => {
                        setCatalogResponse(response.data);
                        setActiveStep(Steps.REVIEW_SCHEMA_IN_EDITOR);
                    })
                    .catch((error) => {
                        if (error.errors) {
                            setFormSubmitError({
                                errors: error.errors,
                                message: 'title',
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
        <Dialog
            open
            onClose={handlers.close}
            scroll="paper"
            fullScreen={fullScreen}
            fullWidth={!fullScreen}
            maxWidth="lg"
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
                        color: (buttonTheme) => buttonTheme.palette.grey[500],
                        position: 'absolute',
                        right: 0,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {formSubmitError && (
                <NewCaptureError title={formSubmitError.message} errors={[]} />
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
                            {links.connectorImage ? (
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
                                        endpoint={links.spec}
                                    />
                                </Paper>
                            ) : null}
                        </form>
                    </ErrorBoundryWrapper>
                ) : null}
                {activeStep === Steps.WAITING_FOR_DISCOVER ? (
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
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
                    <NewCaptureEditor data={catalogResponse?.attributes} />
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={handlers.close} size="large" color="error">
                    <FormattedMessage id="cta.cancel" />
                </Button>

                {activeStep === Steps.REVIEW_SCHEMA_IN_EDITOR ? (
                    <Button
                        onClick={handlers.addToChangeSet}
                        size="large"
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        <FormattedMessage id="cta.addToChangeSet" />
                    </Button>
                ) : (
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
                )}
            </DialogActions>
        </Dialog>
    );
}

export default NewCaptureModal;
