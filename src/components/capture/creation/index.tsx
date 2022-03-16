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
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'stores/CaptureCreationStore';
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
import NewCaptureEditor from './SchemaEditor';
import NewCaptureSpecForm from './SpecForm';
import NewCaptureSpecFormHeader from './SpecFormHeader';

const FORM_ID = 'newCaptureForm';
enum Steps {
    DETAILS_AND_SPEC = 'Getting basic connection details',
    WAITING_FOR_DISCOVER = 'Waiting for discovery call to server',
    CHOOSE_COLLECTIONS = 'Allow customer to choose what schemas they want',
    REVIEW_SCHEMA_IN_EDITOR = 'Allow custom to edit YAML',
}

const selectors = {
    addCapture: (state: CaptureState) => state.addCapture,
    removeSchema: (state: SchemaEditorState) => state.removeSchema,
    schema: (state: SchemaEditorState) => state.schema,
    showNotification: (state: NotificationState) => state.showNotification,
    captureName: (state: CaptureCreationState) => state.details.data.name,
    setDetails: (state: CaptureCreationState) => state.setDetails,
    cleanUp: (state: CaptureCreationState) => state.cleanUp,
    errors: (state: CaptureCreationState) => [
        state.details.errors,
        state.spec.errors,
    ],
    specFormData: (state: CaptureCreationState) => state.spec.data,
    disoverLink: (state: CaptureCreationState) =>
        state.links.discovered_catalog,
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

    // Form store
    const captureName = useCaptureCreationStore(selectors.captureName);
    const [detailErrors, specErrors] = useCaptureCreationStore(
        selectors.errors
    );
    const specFormData = useCaptureCreationStore(selectors.specFormData);
    const disoverLink = useCaptureCreationStore(selectors.disoverLink);
    const cleanUp = useCaptureCreationStore(selectors.cleanUp);

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

    // TODO Schema Editor
    //const [availableSchemas, setAvailableSchemas] = useState<any[]>([]);

    // Form Event Handlers
    const handlers = {
        addToChangeSet: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const catalogNamespace = captureName;

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

            cleanUp();

            navigate('..'); //This is assuming this is a child of the /captures route.
        },

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO - this was to make TS/Linting happy
            detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
            specHasErrors = specErrors ? specErrors.length > 0 : false;

            if (detailHasErrors || specHasErrors) {
                setShowValidation(true);
            } else {
                setFormSubmitting(true);
                setFormSubmitError(null);
                setActiveStep(Steps.WAITING_FOR_DISCOVER);

                discoveredCatalogEndpoint
                    .create(disoverLink, {
                        name: captureName,
                        config: specFormData,
                    })
                    .then((response) => {
                        // TODO Schema Editor
                        // const possibleSchemas =
                        //     discoveredCatalogEndpoint.helpers.getFlowSchema(
                        //         response.data.attributes
                        //     );
                        // setAvailableSchemas(possibleSchemas);

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
            disableEscapeKeyDown
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
                            />
                            <Paper sx={{ width: '100%' }} variant="outlined">
                                <NewCaptureSpecFormHeader />
                                <Divider />
                                <NewCaptureSpecForm
                                    displayValidation={showValidation}
                                    readonly={formSubmitting}
                                />
                            </Paper>
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

                {
                    // TODO Schema Editor
                    // activeStep === Steps.CHOOSE_COLLECTIONS
                    //     ? Object.keys(availableSchemas).map((key: any) => (
                    //           <FormControlLabel
                    //               key={`SchemaSelector-${key}`}
                    //               control={<Checkbox name={key} />}
                    //               label={key}
                    //               checked
                    //           />
                    //       ))
                    //     : null
                }

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
