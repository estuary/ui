import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import RediscoverButton from 'components/capture/RediscoverButton';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_pubId,
    useEditorStore_resetState,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm/hooks';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig/hooks';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_resetState } from 'stores/ResourceConfig/hooks';
import ResourceConfigHydrator from 'stores/ResourceConfig/Hydrator';
import { getPathWithParams } from 'utils/misc-utils';

function CaptureCreate() {
    const navigate = useNavigate();

    const entityType = 'capture';

    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const pubId = useEditorStore_pubId();
    const resetEditorStore = useEditorStore_resetState();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const resetResourceConfigState = useResourceConfig_resetState();

    const [initiateDiscovery, setInitiateDiscovery] = useState<boolean>(true);

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs(persistedDraftId);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
        setInitiateDiscovery(true);
    }, [setDraftId, setInitiateDiscovery, imageTag]);

    const resetState = () => {
        resetDetailsForm();
        resetEndpointConfigState();
        resetResourceConfigState();
        resetFormState();
        resetEditorStore();
        resetBindingsEditorStore();
    };

    const helpers = {
        callFailed: (formState: any) => {
            setFormState({
                status: FormStatus.FAILED,
                exitWhenLogsClose: false,
                ...formState,
            });
        },
        exit: () => {
            resetState();
            navigate(authenticatedRoutes.captures.fullPath);
        },
        jobFailed: (errorTitle: string) => {
            setFormState({
                error: {
                    title: errorTitle,
                },
                status: FormStatus.FAILED,
            });
        },
    };

    // Form Event Handlers
    const handlers = {
        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },

        materializeCollections: () => {
            helpers.exit();
            navigate(
                pubId
                    ? getPathWithParams(
                          authenticatedRoutes.materializations.create.fullPath,
                          {
                              [GlobalSearchParams.PREFILL_PUB_ID]: pubId,
                          }
                      )
                    : authenticatedRoutes.materializations.create.fullPath
            );
        },
    };

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.captures.create.new.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
            }}
        >
            <DetailsFormHydrator>
                <EndpointConfigHydrator>
                    <ResourceConfigHydrator>
                        <EntityCreate
                            title="browserTitle.captureCreate"
                            entityType={entityType}
                            draftSpecMetadata={draftSpecsMetadata}
                            resetState={resetState}
                            errorSummary={
                                <ValidationErrorSummary
                                    errorsExist={detailsFormErrorsExist}
                                />
                            }
                            toolbar={
                                <EntityToolbar
                                    GenerateButton={
                                        <CaptureGenerateButton
                                            entityType={entityType}
                                            disabled={!hasConnectors}
                                            callFailed={helpers.callFailed}
                                            postGenerateMutate={
                                                mutateDraftSpecs
                                            }
                                            createWorkflowMetadata={{
                                                initiateDiscovery,
                                                setInitiateDiscovery,
                                            }}
                                        />
                                    }
                                    TestButton={
                                        <EntityTestButton
                                            closeLogs={handlers.closeLogs}
                                            callFailed={helpers.callFailed}
                                            disabled={!hasConnectors}
                                            logEvent={CustomEvents.CAPTURE_TEST}
                                        />
                                    }
                                    SaveButton={
                                        <EntitySaveButton
                                            closeLogs={handlers.closeLogs}
                                            callFailed={helpers.callFailed}
                                            disabled={!draftId}
                                            materialize={
                                                handlers.materializeCollections
                                            }
                                            logEvent={
                                                CustomEvents.CAPTURE_CREATE
                                            }
                                        />
                                    }
                                />
                            }
                            RediscoverButton={
                                <RediscoverButton
                                    entityType={entityType}
                                    disabled={!hasConnectors}
                                    callFailed={helpers.callFailed}
                                    postGenerateMutate={mutateDraftSpecs}
                                />
                            }
                        />
                    </ResourceConfigHydrator>
                </EndpointConfigHydrator>
            </DetailsFormHydrator>
        </PageContainer>
    );
}

export default CaptureCreate;
