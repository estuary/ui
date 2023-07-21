import { useCallback, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes } from 'app/routes';

import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_resetState,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';

import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';

import { CustomEvents } from 'services/logrocket';

import {
    useDetailsForm_connectorImage,
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

function MaterializationCreate() {
    usePageTitle({
        header: authenticatedRoutes.materializations.create.new.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
    });
    const navigate = useNavigate();

    const entityType = 'materialization';

    // Supabase
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const resetEditorStore = useEditorStore_resetState();
    const mutate_advancedEditor = useEditorStore_queryResponse_mutate();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const resetResourceConfigState = useResourceConfig_resetState();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs(persistedDraftId);

    const updateDraftSpecs = useCallback(async () => {
        await mutateDraftSpecs();
        if (mutate_advancedEditor) {
            await mutate_advancedEditor();
        }
    }, [mutateDraftSpecs, mutate_advancedEditor]);

    const taskNames = useMemo(
        () =>
            draftSpecsMetadata.draftSpecs
                .filter((spec) => spec.spec_type === 'materialization')
                .map((spec) => spec.catalog_name),
        [draftSpecsMetadata.draftSpecs]
    );

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetDetailsForm();
        resetFormState();
        resetResourceConfigState();
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

            navigate(authenticatedRoutes.materializations.fullPath);
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
        <DetailsFormHydrator>
            <EndpointConfigHydrator>
                <ResourceConfigHydrator>
                    <EntityCreate
                        entityType={entityType}
                        draftSpecMetadata={draftSpecsMetadata}
                        resetState={resetState}
                        toolbar={
                            <EntityToolbar
                                GenerateButton={
                                    <MaterializeGenerateButton
                                        disabled={!hasConnectors}
                                        callFailed={helpers.callFailed}
                                        mutateDraftSpecs={updateDraftSpecs}
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
                                        taskNames={taskNames}
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
            </EndpointConfigHydrator>
        </DetailsFormHydrator>
    );
}

export default MaterializationCreate;
