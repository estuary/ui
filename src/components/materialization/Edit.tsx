import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/routes';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/EditGenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm/hooks';
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

function MaterializationEdit() {
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);
    const navigate = useNavigate();

    const entityType = 'materialization';

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const resetDetailsFormState = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    const persistedDraftId = useEditorStore_persistedDraftId();
    const resetEditorStore = useEditorStore_resetState();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const resetResourceConfigState = useResourceConfig_resetState();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } = useDraftSpecs(
        persistedDraftId,
        lastPubId
    );

    const resetState = () => {
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
        resetResourceConfigState();
        resetEditorStore();
        resetBindingsEditorStore();
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

            navigate(authenticatedRoutes.materializations.fullPath, {
                replace: true,
            });
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
                header: authenticatedRoutes.materializations.edit.title,
            }}
        >
            <EndpointConfigHydrator>
                <ResourceConfigHydrator>
                    <EntityEdit
                        title="browserTitle.materializationEdit"
                        entityType={entityType}
                        readOnly={{ detailsForm: true }}
                        draftSpecMetadata={draftSpecsMetadata}
                        callFailed={helpers.callFailed}
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
                                        mutateDraftSpecs={mutateDraftSpecs}
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
                            />
                        }
                    />
                </ResourceConfigHydrator>
            </EndpointConfigHydrator>
        </PageContainer>
    );
}

export default MaterializationEdit;
