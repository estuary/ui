import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'hooks/connectors/useHasConnectors';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback, useEffect } from 'react';
import { CustomEvents } from 'services/types';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import WorkflowHydrator from 'stores/Workflow/Hydrator';
import TrialOnlyPrefixHydrator from '../TrialOnlyPrefixHydrator';

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
    }, [imageTag, setDraftId]);

    return (
        <WorkflowHydrator>
            <MutateDraftSpecProvider value={updateDraftSpecs}>
                <TrialOnlyPrefixHydrator>
                    <EntityCreate
                        entityType={entityType}
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
                                    logEvent:
                                        CustomEvents.MATERIALIZATION_CREATE,
                                }}
                                secondaryButtonProps={{
                                    disabled: !hasConnectors,
                                    logEvent: CustomEvents.MATERIALIZATION_TEST,
                                }}
                            />
                        }
                    />
                </TrialOnlyPrefixHydrator>
            </MutateDraftSpecProvider>
        </WorkflowHydrator>
    );
}

export default MaterializationCreate;
