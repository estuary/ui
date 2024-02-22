import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'components/shared/Entity/MutateDraftSpecContext';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback, useEffect, useMemo } from 'react';
import { CustomEvents } from 'services/types';
import BindingHydrator from 'stores/Binding/Hydrator';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm/hooks';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';

function MaterializationCreate() {
    usePageTitle({
        header: authenticatedRoutes.materializations.create.new.title,
        headerLink:
            'https://docs.estuary.dev/guides/create-dataflow/#create-a-materialization',
    });

    const entityType = 'materialization';

    // Supabase
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();

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
                                                CustomEvents.MATERIALIZATION_CREATE
                                            }
                                        />
                                    }
                                />
                            }
                        />
                    </MutateDraftSpecProvider>
                </BindingHydrator>
            </EndpointConfigHydrator>
        </DetailsFormHydrator>
    );
}

export default MaterializationCreate;
