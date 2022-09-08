import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import {
    useEditorStore_id,
    useEditorStore_setId,
} from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import { useEntityType } from 'components/shared/Entity/EntityContext';
import FooHeader from 'components/shared/Entity/Header';
import PageContainer from 'components/shared/PageContainer';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
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
import { EntityFormState, FormStatus } from 'stores/FormState';
import { ResourceConfigState } from 'stores/ResourceConfig';

const draftEditorStoreName = DraftEditorStoreNames.MATERIALIZATION;
const formStateStoreName = FormStateStoreNames.MATERIALIZATION_CREATE;
const resourceConfigStoreName = ResourceConfigStoreNames.MATERIALIZATION;

function MaterializationCreate() {
    const navigate = useNavigate();

    const entityType = useEntityType();

    // Supabase
    const supabaseClient = useClient();
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
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const setFormState = useZustandStore<
        EntityFormState,
        EntityFormState['setFormState']
    >(formStateStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        EntityFormState,
        EntityFormState['resetState']
    >(formStateStoreName, (state) => state.resetState);

    const exitWhenLogsClose = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['exitWhenLogsClose']
    >(formStateStoreName, (state) => state.formState.exitWhenLogsClose);

    // Resource Config Store
    const resourceConfigErrorsExist = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    const resetResourceConfigState = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(resourceConfigStoreName, (state) => state.resetState);

    const resourceConfigChanged = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(resourceConfigStoreName, (state) => state.stateChanged);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetResourceConfigState();
        resetDetailsForm();
        resetFormState();
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
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.materializations.create.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
            }}
        >
            <EntityCreate
                title="browserTitle.materializationCreate"
                connectorType={entityType}
                showCollections
                promptDataLoss={
                    endpointConfigChanged() ||
                    resourceConfigChanged() ||
                    detailsFormChanged()
                }
                resetState={resetState}
                Header={
                    <FooHeader
                        GenerateButton={
                            <MaterializeGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                draftEditorStoreName={draftEditorStoreName}
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                                formStateStoreName={formStateStoreName}
                            />
                        }
                        TestButton={
                            <EntityTestButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                                logEvent={CustomEvents.MATERIALIZATION_TEST}
                                draftEditorStoreName={draftEditorStoreName}
                                formStateStoreName={formStateStoreName}
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
                                disabled={!draftId}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                                logEvent={CustomEvents.MATERIALIZATION_CREATE}
                                draftEditorStoreName={draftEditorStoreName}
                                formStateStoreName={formStateStoreName}
                            />
                        }
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                        formErrorsExist={
                            detailsFormErrorsExist ||
                            endpointConfigErrorsExist ||
                            resourceConfigErrorsExist
                        }
                        resourceConfigStoreName={resourceConfigStoreName}
                        formStateStoreName={formStateStoreName}
                    />
                }
                draftEditorStoreName={draftEditorStoreName}
                resourceConfigStoreName={resourceConfigStoreName}
                formStateStoreName={formStateStoreName}
            />
        </PageContainer>
    );
}

export default MaterializationCreate;
