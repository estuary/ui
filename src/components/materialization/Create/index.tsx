import { useCallback, useEffect } from 'react';

import { authenticatedRoutes } from 'src/app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import MaterializeGenerateButton from 'src/components/materialization/GenerateButton';
import EntityCreate from 'src/components/shared/Entity/Create';
import EntityToolbar from 'src/components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'src/components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'src/hooks/connectors/useHasConnectors';
import useDraftSpecs from 'src/hooks/useDraftSpecs';
import usePageTitle from 'src/hooks/usePageTitle';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';

function MaterializationCreate() {
    usePageTitle({
        header: authenticatedRoutes.materializations.create.new.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
    });

    const entityType = 'materialization';

    // Supabase
    const hasConnectors = useValidConnectorsExist(entityType);

    // Details Form Store
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const mutate_advancedEditor = useEditorStore_queryResponse_mutate();

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
    }, [imageTag, setDraftId]);

    return (
        <WorkflowHydrator>
            <MutateDraftSpecProvider value={updateDraftSpecs}>
                <EntityCreate
                    entityType={entityType}
                    draftSpecMetadata={draftSpecsMetadata}
                    Toolbar={
                        <EntityToolbar
                            GenerateButton={
                                <MaterializeGenerateButton
                                    disabled={!hasConnectors}
                                />
                            }
                            primaryButtonProps={{
                                disabled: !draftId,
                                logEvent: CustomEvents.MATERIALIZATION_CREATE,
                            }}
                            secondaryButtonProps={{
                                disabled: !hasConnectors,
                                logEvent: CustomEvents.MATERIALIZATION_TEST,
                            }}
                        />
                    }
                />
            </MutateDraftSpecProvider>
        </WorkflowHydrator>
    );
}

export default MaterializationCreate;
