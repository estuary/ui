import { useCallback, useEffect, useState } from 'react';

import CaptureGenerateButton from 'src/components/capture/GenerateButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import EntityCreateExpress from 'src/components/shared/Entity/Create/Express';
import EntityToolbar from 'src/components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useEntityType } from 'src/context/EntityContext';
import useValidConnectorsExist from 'src/hooks/connectors/useHasConnectors';
import useDraftSpecs from 'src/hooks/useDraftSpecs';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';
import { MAX_DISCOVER_TIME } from 'src/utils/misc-utils';

export default function ExpressCaptureCreate() {
    const entityType = useEntityType();
    const hasConnectors = useValidConnectorsExist(entityType);

    // Details Form Store
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );
    const entityNameChanged = useDetailsFormStore(
        (state) => state.entityNameChanged
    );

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Endpoint Config Store
    const mutate_advancedEditor = useEditorStore_queryResponse_mutate();

    const [initiateDiscovery, setInitiateDiscovery] = useState(true);

    // TODO (cache helper) - we should switch this over to use the mutate hook if we can
    //  might also need to find a new way to get all the task names
    const { mutate: mutateDraftSpecs } = useDraftSpecs(
        persistedDraftId,
        entityType
    );

    const updateDraftSpecs = useCallback(async () => {
        await mutateDraftSpecs();
        if (mutate_advancedEditor) {
            await mutate_advancedEditor();
        }
    }, [mutateDraftSpecs, mutate_advancedEditor]);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
        setInitiateDiscovery(true);
    }, [setDraftId, setInitiateDiscovery, imageTag]);

    // If the name changed we need to make sure we run discovery again
    useEffect(() => {
        if (entityNameChanged) {
            setInitiateDiscovery(true);
        }
    }, [entityNameChanged]);

    if (entityType !== 'capture') {
        return null;
    }

    return (
        <WorkflowHydrator expressWorkflow>
            <MutateDraftSpecProvider value={updateDraftSpecs}>
                <EntityCreateExpress
                    entityType={entityType}
                    Toolbar={
                        <EntityToolbar
                            expressWorkflow
                            waitTimes={{
                                generate: MAX_DISCOVER_TIME,
                            }}
                            primaryButtonProps={{
                                disabled: !draftId,
                                logEvent: CustomEvents.CAPTURE_CREATE,
                            }}
                            secondaryButtonProps={{
                                disabled: !hasConnectors,
                                logEvent: CustomEvents.CAPTURE_TEST,
                            }}
                            GenerateButton={
                                <CaptureGenerateButton
                                    entityType={entityType}
                                    disabled={!hasConnectors}
                                    createWorkflowMetadata={{
                                        initiateDiscovery,
                                        setInitiateDiscovery,
                                    }}
                                />
                            }
                        />
                    }
                />
            </MutateDraftSpecProvider>
        </WorkflowHydrator>
    );
}
