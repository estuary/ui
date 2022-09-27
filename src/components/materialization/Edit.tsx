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
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary/extensions/WithResourceConfigErrors';
import PageContainer from 'components/shared/PageContainer';
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
import { EndpointConfigProvider } from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState';
import { ResourceConfigProvider } from 'stores/ResourceConfig';
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

    // TODO (placement): Relocate endpoint config-related store selectors.
    // Endpoint Config Store
    // const resetEndpointConfigState = useEndpointConfigStore_reset();
    // const endpointConfigChanged = useEndpointConfigStore_changed();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const setFormState = useFormStateStore_setFormState();

    const resetFormState = useFormStateStore_resetState();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // TODO (placement): Relocate resource config-related store selectors.
    // Resource Config Store
    // const resourceConfigChanged = useResourceConfig_stateChanged();

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetFormState();
        // resetEndpointConfigState();
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
            <EndpointConfigProvider entityType={entityType}>
                <ResourceConfigProvider workflow="materialization_edit">
                    <EntityEdit
                        title="browserTitle.materializationEdit"
                        entityType={entityType}
                        showCollections
                        promptDataLoss={
                            // endpointConfigChanged() ||
                            // resourceConfigChanged() ||
                            detailsFormChanged()
                        }
                        readOnly={{ detailsForm: true }}
                        resetState={resetState}
                        callFailed={helpers.callFailed}
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
                                        logEvent={
                                            CustomEvents.MATERIALIZATION_TEST
                                        }
                                    />
                                }
                                SaveButton={
                                    <EntitySaveButton
                                        disabled={!draftId}
                                        callFailed={helpers.callFailed}
                                        closeLogs={handlers.closeLogs}
                                        logEvent={
                                            CustomEvents.MATERIALIZATION_EDIT
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
                                        errorsExist={detailsFormErrorsExist}
                                    />
                                }
                            />
                        }
                    />
                </ResourceConfigProvider>
            </EndpointConfigProvider>
        </PageContainer>
    );
}

export default MaterializationEdit;
