import { useCallback, useEffect, useState } from 'react';

import { authenticatedRoutes } from 'src/app/routes';
import CaptureGenerateButton from 'src/components/capture/GenerateButton';
import RediscoverButton from 'src/components/capture/RediscoverButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import EntityCreate from 'src/components/shared/Entity/Create';
import EntityToolbar from 'src/components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'src/components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'src/hooks/connectors/useHasConnectors';
import useDraftSpecs from 'src/hooks/useDraftSpecs';
import usePageTitle from 'src/hooks/usePageTitle';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';
import { MAX_DISCOVER_TIME } from 'src/utils/misc-utils';

const entityType = 'capture';
function CaptureCreate() {
    usePageTitle({
        header: authenticatedRoutes.captures.create.new.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
    });

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

    const [initiateDiscovery, setInitiateDiscovery] = useState<boolean>(true);

    // TODO (cache helper) - we should switch this over to use the mutate hook if we can
    //  might also need to find a new way to get all the task names
    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } = useDraftSpecs(
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

    return (
        <WorkflowHydrator>
            qqqqqqq
            <MutateDraftSpecProvider value={updateDraftSpecs}>
                lkajsdf
                <EntityCreate
                    entityType={entityType}
                    draftSpecMetadata={draftSpecsMetadata}
                    Toolbar={
                        <EntityToolbar
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
                    RediscoverButton={
                        <RediscoverButton
                            entityType={entityType}
                            disabled={!hasConnectors}
                        />
                    }
                />
            </MutateDraftSpecProvider>
        </WorkflowHydrator>
    );
}

export default CaptureCreate;
