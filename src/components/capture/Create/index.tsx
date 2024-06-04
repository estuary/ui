import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import RediscoverButton from 'components/capture/RediscoverButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'hooks/connectors/useHasConnectors';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomEvents } from 'services/types';
import BindingHydrator from 'stores/Binding/Hydrator';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import { MAX_DISCOVER_TIME } from 'utils/misc-utils';

function CaptureCreate() {
    usePageTitle({
        header: authenticatedRoutes.captures.create.new.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
    });

    const entityType = 'capture';

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

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs(persistedDraftId);

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

    const taskNames = useMemo(
        () =>
            draftSpecsMetadata.draftSpecs
                .filter((spec) => spec.spec_type === 'capture')
                .map((spec) => spec.catalog_name),
        [draftSpecsMetadata.draftSpecs]
    );

    return (
        <DetailsFormHydrator>
            <EndpointConfigHydrator>
                <BindingHydrator>
                    <MutateDraftSpecProvider value={updateDraftSpecs}>
                        <EntityCreate
                            entityType={entityType}
                            draftSpecMetadata={draftSpecsMetadata}
                            toolbar={
                                <EntityToolbar
                                    taskNames={taskNames}
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
                </BindingHydrator>
            </EndpointConfigHydrator>
        </DetailsFormHydrator>
    );
}

export default CaptureCreate;
