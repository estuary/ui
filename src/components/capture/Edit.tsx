import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import RediscoverButton from 'components/capture/RediscoverButton';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_pubId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
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

function CaptureEdit() {
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);
    const navigate = useNavigate();

    const entityType = 'capture';

    // Supabase stuff
    const supabaseClient = useClient();

    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();

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

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } = useDraftSpecs(
        persistedDraftId,
        { lastPubId }
    );

    const taskNames = useMemo(
        () =>
            draftSpecsMetadata.draftSpecs
                .filter((spec) => spec.spec_type === 'capture')
                .map((spec) => spec.catalog_name),
        [draftSpecsMetadata.draftSpecs]
    );

    const resetState = () => {
        resetDetailsForm();
        resetEndpointConfigState();
        resetResourceConfigState();
        resetFormState();
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

            navigate(authenticatedRoutes.captures.fullPath, { replace: true });
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
                header: authenticatedRoutes.captures.edit.title,
            }}
        >
            <DraftInitializer>
                <DetailsFormHydrator>
                    <EndpointConfigHydrator>
                        <ResourceConfigHydrator>
                            <EntityEdit
                                title="browserTitle.captureEdit"
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
                                            <CaptureGenerateButton
                                                entityType={entityType}
                                                disabled={!hasConnectors}
                                                callFailed={helpers.callFailed}
                                                postGenerateMutate={
                                                    mutateDraftSpecs
                                                }
                                            />
                                        }
                                        TestButton={
                                            <EntityTestButton
                                                closeLogs={handlers.closeLogs}
                                                callFailed={helpers.callFailed}
                                                disabled={!hasConnectors}
                                                logEvent={
                                                    CustomEvents.CAPTURE_TEST
                                                }
                                            />
                                        }
                                        SaveButton={
                                            <EntitySaveButton
                                                closeLogs={handlers.closeLogs}
                                                callFailed={helpers.callFailed}
                                                disabled={!draftId}
                                                taskNames={taskNames}
                                                materialize={
                                                    handlers.materializeCollections
                                                }
                                                logEvent={
                                                    CustomEvents.CAPTURE_EDIT
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
            </DraftInitializer>
        </PageContainer>
    );
}

export default CaptureEdit;
