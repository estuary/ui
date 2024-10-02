import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { getLiveSpecSpec } from 'api/liveSpecsExt';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { CustomEvents } from 'services/types';
import { useBinding_collectionsBeingBackfilled } from 'stores/Binding/hooks';
import {
    getBindingAsFullSource,
    getCollectionName,
} from 'utils/workflow-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function MarkMaterialization() {
    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

    const [
        updateStep,
        updateContext,
        nextStep,
        initUUID,
        backfillTargetId,
        backfillTargetName,
        timeStopped,
    ] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
        state.nextStep,
        state.initUUID,
        state.context.backfillTarget?.id,
        state.context.backfillTarget?.catalog_name,
        state.context.timeStopped,
    ]);

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const updateMaterializationTimestamp = async () => {
                const draftsResponse = await createEntityDraft(
                    `${CustomEvents.DATA_FLOW_RESET} : updateTimestamp : ${initUUID}`
                );
                const dataFlowResetDraftId = draftsResponse.data?.[0].id;

                if (draftsResponse.error || !dataFlowResetDraftId) {
                    updateStep(stepIndex, {
                        error: draftsResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateContext({
                    dataFlowResetDraftId,
                });

                // Update the spec here if we have a target
                let updatedSpec = null;
                let noMatchingBindings = true;
                if (backfillTargetId) {
                    const liveSpecResponse = await getLiveSpecSpec(
                        backfillTargetId
                    );

                    if (liveSpecResponse.error) {
                        updateStep(stepIndex, {
                            error: liveSpecResponse.error,
                            progress: ProgressStates.FAILED,
                        });
                        return;
                    }

                    updatedSpec = {
                        ...liveSpecResponse.data.spec,
                    };
                    updatedSpec.bindings.forEach((binding: any) => {
                        if (
                            collectionsBeingBackfilled.includes(
                                getCollectionName(binding)
                            )
                        ) {
                            binding.source = getBindingAsFullSource(binding);
                            binding.source.notBefore = timeStopped;
                            noMatchingBindings = false;
                        }
                    });
                }

                const skipped = Boolean(
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    noMatchingBindings || !backfillTargetName || !updatedSpec
                );

                if (!skipped && backfillTargetName && updatedSpec) {
                    // Add to the draft
                    const draftedMaterialization = await createDraftSpec(
                        dataFlowResetDraftId,
                        backfillTargetName,
                        updatedSpec,
                        'materialization',
                        undefined,
                        false
                    );

                    if (draftedMaterialization.error) {
                        updateStep(stepIndex, {
                            error: draftedMaterialization.error,
                            progress: ProgressStates.FAILED,
                        });
                        return;
                    }
                }

                updateStep(stepIndex, {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    progress: skipped
                        ? ProgressStates.SKIPPED
                        : ProgressStates.SUCCESS,
                    valid: true,
                });
                nextStep();
            };

            void updateMaterializationTimestamp();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default MarkMaterialization;
