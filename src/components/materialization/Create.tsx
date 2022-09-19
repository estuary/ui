import { authenticatedRoutes } from 'app/Authenticated';
import {
    useEditorStore_id,
    useEditorStore_setId,
} from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import FooHeader from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary/materialization';
import PageContainer from 'components/shared/PageContainer';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { ResourceConfigProvider } from 'context/zustand/ResourceConfig';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_changed,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_reset,
} from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState';
import { createHydratedResourceConfigStore } from 'stores/ResourceConfig';
import { ENTITY } from 'types';

function MaterializationCreate() {
    const navigate = useNavigate();

    const entityType = ENTITY.MATERIALIZATION;

    // Supabase
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const detailsFormChanged = useDetailsForm_changed();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    const setDraftId = useEditorStore_setId();

    // Endpoint Config Store
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const resetEndpointConfigState = useEndpointConfigStore_reset();
    const endpointConfigChanged = useEndpointConfigStore_changed();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const setFormState = useFormStateStore_setFormState();

    const resetFormState = useFormStateStore_resetState();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    // const resourceConfigChanged = useResourceConfig_stateChanged();

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetDetailsForm();
        resetFormState();
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
            <ResourceConfigProvider
                storeName={ResourceConfigStoreNames.MATERIALIZATION_CREATE}
                createStore={createHydratedResourceConfigStore}
            >
                <EntityCreate
                    title="browserTitle.materializationCreate"
                    connectorType={entityType}
                    showCollections
                    promptDataLoss={
                        endpointConfigChanged() ||
                        // resourceConfigChanged() ||
                        detailsFormChanged()
                    }
                    resetState={resetState}
                    Header={
                        <FooHeader
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
                            heading={
                                <FormattedMessage
                                    id={`${messagePrefix}.heading`}
                                />
                            }
                            ErrorSummary={
                                <ValidationErrorSummary
                                    errorsExist={
                                        detailsFormErrorsExist ||
                                        endpointConfigErrorsExist
                                    }
                                />
                            }
                        />
                    }
                />
            </ResourceConfigProvider>
        </PageContainer>
    );
}

export default MaterializationCreate;
