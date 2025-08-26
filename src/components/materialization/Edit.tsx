import { useCallback } from 'react';

import { authenticatedRoutes } from 'src/app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import MaterializeGenerateButton from 'src/components/materialization/GenerateButton';
import EntityEdit from 'src/components/shared/Entity/Edit';
import DraftInitializer from 'src/components/shared/Entity/Edit/DraftInitializer';
import EntityToolbar from 'src/components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'src/components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'src/hooks/connectors/useHasConnectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDraftSpecs_editWorkflow } from 'src/hooks/useDraftSpecs';
import usePageTitle from 'src/hooks/usePageTitle';
import { CustomEvents } from 'src/services/types';
import WorkflowHydrator from 'src/stores/Workflow/Hydrator';

function MaterializationEdit() {
    usePageTitle({
        header: authenticatedRoutes.materializations.edit.title,
    });
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    const entityType = 'materialization';

    // Supabase
    const hasConnectors = useValidConnectorsExist(entityType);

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const mutate_advancedEditor = useEditorStore_queryResponse_mutate();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs_editWorkflow(persistedDraftId, lastPubId);

    const updateDraftSpecs = useCallback(async () => {
        await mutateDraftSpecs();
        if (mutate_advancedEditor) {
            await mutate_advancedEditor();
        }
    }, [mutateDraftSpecs, mutate_advancedEditor]);

    return (
        <DraftInitializer>
            <WorkflowHydrator>
                <MutateDraftSpecProvider value={updateDraftSpecs}>
                    <EntityEdit
                        title="routeTitle.materializationEdit"
                        entityType={entityType}
                        readOnly={{ detailsForm: true }}
                        draftSpecMetadata={draftSpecsMetadata}
                        toolbar={
                            <EntityToolbar
                                GenerateButton={
                                    <MaterializeGenerateButton
                                        disabled={!hasConnectors}
                                    />
                                }
                                primaryButtonProps={{
                                    disabled: !draftId,
                                    logEvent: CustomEvents.MATERIALIZATION_EDIT,
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
        </DraftInitializer>
    );
}

export default MaterializationEdit;
