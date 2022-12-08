import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_resetState } from 'stores/ResourceConfig/hooks';
import ResourceConfigHydrator from 'stores/ResourceConfig/Hydrator';

function MaterializationCreate() {
    const navigate = useNavigate();

    const entityType = 'materialization';

    // Supabase
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // TODO (placement): Relocate resource config-related store selectors.
    // Resource Config Store
    // const resourceConfigChanged = useResourceConfig_stateChanged();
    const resetResourceConfigState = useResourceConfig_resetState();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs(persistedDraftId);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetDetailsForm();
        resetFormState();
        resetResourceConfigState();
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

            navigate(authenticatedRoutes.materializations.path);
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
    };

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.materializations.create.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
            }}
        >
            <ResourceConfigHydrator>
                <EntityCreate
                    title="browserTitle.materializationCreate"
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
                                <MaterializeGenerateButton
                                    disabled={!hasConnectors}
                                    callFailed={helpers.callFailed}
                                />
                            }
                            TestButton={
                                <EntityTestButton
                                    disabled={!hasConnectors}
                                    callFailed={helpers.callFailed}
                                    closeLogs={handlers.closeLogs}
                                    logEvent={CustomEvents.MATERIALIZATION_TEST}
                                />
                            }
                            SaveButton={
                                <EntitySaveButton
                                    disabled={!draftId}
                                    callFailed={helpers.callFailed}
                                    closeLogs={handlers.closeLogs}
                                    logEvent={
                                        CustomEvents.MATERIALIZATION_CREATE
                                    }
                                />
                            }
                        />
                    }
                />
            </ResourceConfigHydrator>
        </PageContainer>
    );
}

export default MaterializationCreate;
