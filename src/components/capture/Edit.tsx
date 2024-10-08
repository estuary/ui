import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import RediscoverButton from 'components/capture/RediscoverButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import EntityEdit from 'components/shared/Entity/Edit';
import EntityToolbar from 'components/shared/Entity/Header';
import { MutateDraftSpecProvider } from 'components/shared/Entity/MutateDraftSpecContext';
import useValidConnectorsExist from 'hooks/connectors/useHasConnectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useDraftSpecs_editWorkflow } from 'hooks/useDraftSpecs';
import usePageTitle from 'hooks/usePageTitle';
import { useCallback } from 'react';
import { CustomEvents } from 'services/types';
import WorkflowHydrator from 'stores/Workflow/Hydrator';
import { MAX_DISCOVER_TIME } from 'utils/misc-utils';

const entityType = 'capture';
function CaptureEdit() {
    usePageTitle({
        header: authenticatedRoutes.captures.edit.title,
    });

    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

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
        <WorkflowHydrator>
            <MutateDraftSpecProvider value={updateDraftSpecs}>
                <EntityEdit
                    title="routeTitle.captureEdit"
                    entityType={entityType}
                    readOnly={{ detailsForm: true }}
                    draftSpecMetadata={draftSpecsMetadata}
                    toolbar={
                        <EntityToolbar
                            waitTimes={{
                                generate: MAX_DISCOVER_TIME,
                            }}
                            primaryButtonProps={{
                                disabled: !draftId,
                                logEvent: CustomEvents.CAPTURE_EDIT,
                            }}
                            secondaryButtonProps={{
                                disabled: !hasConnectors,
                                logEvent: CustomEvents.CAPTURE_TEST,
                            }}
                            GenerateButton={
                                <CaptureGenerateButton
                                    entityType={entityType}
                                    disabled={!hasConnectors}
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

export default CaptureEdit;
