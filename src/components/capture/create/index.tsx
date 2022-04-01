import {
    Button,
    Divider,
    Paper,
    Stack,
    Toolbar,
    Typography
} from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState
} from 'components/capture/create/Store';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import {
    DiscoveredCatalog,
    discoversEndpoint
} from 'endpoints/discovers';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import useChangeSetStore, {
    ChangeSetState,
    Entity
} from 'stores/ChangeSetStore';
import useNotificationStore, {
    Notification,
    NotificationState
} from 'stores/NotificationStore';
import useSchemaEditorStore, {
    SchemaEditorState
} from 'stores/SchemaEditorStore';
import NewCaptureEditor from './CatalogEditor';
import NewCaptureDetails from './DetailsForm';
import NewCaptureError from './Error';
import NewCaptureSpecForm from './SpecForm';
import NewCaptureSpecFormHeader from './SpecFormHeader';

const FORM_ID = 'newCaptureForm';

const selectors = {
    addCapture: (state: ChangeSetState) => state.addCapture,
    clearResources: (state: SchemaEditorState) => state.clearResources,
    resources: (state: SchemaEditorState) => state.resources,
    showNotification: (state: NotificationState) => state.showNotification,
    captureName: (state: CaptureCreationState) => state.details.data.name,
    setDetails: (state: CaptureCreationState) => state.setDetails,
    resetState: (state: CaptureCreationState) => state.resetState,
    hasChanges: (state: CaptureCreationState) => state.hasChanges,
    errors: (state: CaptureCreationState) => [
        state.details.errors,
        state.spec.errors,
    ],
    specFormData: (state: CaptureCreationState) => state.spec.data,
    disoverLink: (state: CaptureCreationState) =>
        state.links.discovered_catalog,
    hasConnectors: (state: CaptureCreationState) => state.hasConnectors,
};

function CaptureCreation() {
    const navigate = useNavigate();
    const confirmationModalContext = useConfirmationModalContext();

    // Schema editor store
    const resourcesFromEditor = useSchemaEditorStore(selectors.resources);
    const clearResourcesFromEditor = useSchemaEditorStore(
        selectors.clearResources
    );

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
    const resetState = useCaptureCreationStore(selectors.resetState);
    const hasChanges = useCaptureCreationStore(selectors.hasChanges);
    const hasConnectors = useCaptureCreationStore(selectors.hasConnectors);

    // Form props
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] =
        useState<DiscoveredCatalog | null>(null);

    const exit = () => {
        if (Object.keys(resourcesFromEditor).length > 0) {
            clearResourcesFromEditor();
        }

        resetState();

        navigate('/captures');
    };

    // Form Event Handlers
    const handlers = {
        addToChangeSet: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const catalogNamespace = captureName;

            // TODO: Get connector type value from store.
            const capture: Entity = {
                metadata: {
                    catalogNamespace,
                    dateCreated: Date(),
                    deploymentStatus: 'ACTIVE',
                    connectorType: 'Hello World',
                    name: catalogNamespace.substring(
                        catalogNamespace.lastIndexOf('/') + 1,
                        catalogNamespace.length
                    ),
                },
                resources:
                    Object.keys(resourcesFromEditor).length > 0
                        ? resourcesFromEditor
                        : catalogResponse,
            };

            const notification: Notification = {
                description: 'Your changes can be viewed on the Builds page.',
                severity: 'success',
                title: 'New Capture Created',
            };

            addCaptureToChangeSet(catalogNamespace, capture);
            showNotification(notification);

            setFormSubmitting(true);

            exit();
        },

        close: () => {
            if (hasChanges()) {
                confirmationModalContext
                    ?.showConfirmation({
                        message: 'confirm.loseData',
                    })
                    .then((confirmed) => {
                        if (confirmed) {
                            exit();
                        }
                    })
                    .catch(() => { });
            } else {
                exit();
            }
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

                discoveredCatalogEndpoint
                    .create(disoverLink, {
                        name: captureName,
                        config: specFormData,
                    })
                    .then((response) => {
                        setCatalogResponse(response.data);
                    })
                    .catch((error) => {
                        setFormSubmitError(error);
                    })
                    .finally(() => {
                        setFormSubmitting(false);
                    });
            }
        },
    };

    return (
        <PageContainer>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    <FormattedMessage id="captureCreation.heading" />
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <Button onClick={handlers.close} color="error">
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button
                        onClick={handlers.test}
                        disabled={formSubmitting || !hasConnectors}
                        form={FORM_ID}
                        type="submit"
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        <FormattedMessage id="captureCreation.ctas.discover" />
                    </Button>

                    <Button
                        onClick={handlers.addToChangeSet}
                        disabled={!catalogResponse || formSubmitting}
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
                </Stack>
            </Toolbar>

            {formSubmitError && (
                <NewCaptureError
                    title="captureCreation.save.failed"
                    errors={formSubmitError.errors}
                />
            )}

            <ErrorBoundryWrapper>
                <form id={FORM_ID}>
                    <Typography variant="h5">Capture Details</Typography>
                    <NewCaptureDetails
                        displayValidation={showValidation}
                        readonly={formSubmitting}
                    />
                    <Typography variant="h5">Connection Config</Typography>
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

            {catalogResponse ? (
                <>
                    <Typography variant="h5">Catalog Editor</Typography>
                    <NewCaptureEditor data={catalogResponse.attributes} />
                </>
            ) : null}
        </PageContainer>
    );
}

export default CaptureCreation;
