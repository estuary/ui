import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import RediscoverButton from 'components/capture/RediscoverButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import EntityToolbar from 'components/shared/Entity/Header';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback, useMemo } from 'react';
import { CustomEvents } from 'services/logrocket';
import { DetailsFormHydrator } from 'stores/DetailsForm/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import ResourceConfigHydrator from 'stores/ResourceConfig/Hydrator';
import { MAX_DISCOVER_TIME } from 'utils/misc-utils';

function CaptureEdit() {
    usePageTitle({
        header: authenticatedRoutes.captures.edit.title,
    });

    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    const entityType = 'capture';

    // Supabase
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

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
                .filter((spec) => spec.spec_type === 'capture')
                .map((spec) => spec.catalog_name),
        [draftSpecsMetadata.draftSpecs]
    );

    return (
        <DraftInitializer>
            <DetailsFormHydrator>
                <EndpointConfigHydrator>
                    <ResourceConfigHydrator>
                        <EntityEdit
                            title="routeTitle.captureEdit"
                            entityType={entityType}
                            readOnly={{ detailsForm: true }}
                            draftSpecMetadata={draftSpecsMetadata}
                            toolbar={
                                <EntityToolbar
                                    waitTimes={{ generate: MAX_DISCOVER_TIME }}
                                    GenerateButton={
                                        <CaptureGenerateButton
                                            entityType={entityType}
                                            disabled={!hasConnectors}
                                            postGenerateMutate={
                                                updateDraftSpecs
                                            }
                                        />
                                    }
                                    TestButton={
                                        <EntityTestButton
                                            disabled={!hasConnectors}
                                            logEvent={CustomEvents.CAPTURE_TEST}
                                        />
                                    }
                                    SaveButton={
                                        <EntitySaveButton
                                            disabled={!draftId}
                                            taskNames={taskNames}
                                            logEvent={CustomEvents.CAPTURE_EDIT}
                                        />
                                    }
                                />
                            }
                            RediscoverButton={
                                <RediscoverButton
                                    entityType={entityType}
                                    disabled={!hasConnectors}
                                    postGenerateMutate={mutateDraftSpecs}
                                />
                            }
                        />
                    </ResourceConfigHydrator>
                </EndpointConfigHydrator>
            </DetailsFormHydrator>
        </DraftInitializer>
    );
}

export default CaptureEdit;
