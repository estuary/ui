import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import EntityToolbar from 'components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'components/shared/Entity/MutateDraftSpecContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback, useMemo } from 'react';
import { CustomEvents } from 'services/types';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import ResourceConfigHydrator from 'stores/ResourceConfig/Hydrator';
import useValidConnectorsExist from 'hooks/connectors/useHasConnectors';

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

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } = useDraftSpecs(
        persistedDraftId,
        { lastPubId }
    );

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

    return (
        <DraftInitializer>
            <DetailsFormHydrator>
                <EndpointConfigHydrator>
                    <ResourceConfigHydrator>
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
                                        TestButton={
                                            <EntityTestButton
                                                disabled={!hasConnectors}
                                                logEvent={
                                                    CustomEvents.MATERIALIZATION_TEST
                                                }
                                            />
                                        }
                                        SaveButton={
                                            <EntitySaveButton
                                                disabled={!draftId}
                                                taskNames={taskNames}
                                                logEvent={
                                                    CustomEvents.MATERIALIZATION_EDIT
                                                }
                                            />
                                        }
                                    />
                                }
                            />
                        </MutateDraftSpecProvider>
                    </ResourceConfigHydrator>
                </EndpointConfigHydrator>
            </DetailsFormHydrator>
        </DraftInitializer>
    );
}

export default MaterializationEdit;
