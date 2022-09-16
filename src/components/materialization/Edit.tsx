import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import {
    useEditorStore_id,
    useEditorStore_setId,
} from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/EditGenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import FooHeader from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary/materialization';
import PageContainer from 'components/shared/PageContainer';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { ResourceConfigProvider } from 'context/zustand/ResourceConfig';
import { useClient } from 'hooks/supabase-swr';
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
import { createResourceConfigStore } from 'stores/ResourceConfig';
import { ENTITY } from 'types';

function MaterializationEdit() {
    const navigate = useNavigate();

    const entityType = ENTITY.MATERIALIZATION;

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const detailsFormChanged = useDetailsForm_changed();
    const resetDetailsFormState = useDetailsForm_resetState();

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

    // const resourceConfigErrorsExist =
    //     useResourceConfig_resourceConfigErrorsExist();

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
    };

    const helpers = {
        callFailed: (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: FormStatus.FAILED,
                    exitWhenLogsClose: false,
                    ...formState,
                });
            };

            if (subscription) {
                supabaseClient
                    .removeSubscription(subscription)
                    .then(() => {
                        setFailureState();
                    })
                    .catch(() => {});
            } else {
                setFailureState();
            }
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
        <PageContainer>
            <ResourceConfigProvider
                storeName={ResourceConfigStoreNames.MATERIALIZATION_EDIT}
                createStore={createResourceConfigStore}
            >
                <EntityEdit
                    title="browserTitle.materializationEdit"
                    entityType={entityType}
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
                                    logEvent={CustomEvents.MATERIALIZATION_EDIT}
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
                    callFailed={helpers.callFailed}
                    readOnly={{
                        detailsForm: true,
                        endpointConfigForm: true,
                    }}
                />
            </ResourceConfigProvider>
        </PageContainer>
    );
}

export default MaterializationEdit;
