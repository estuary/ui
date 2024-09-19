import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { getLiveSpecSpec } from 'api/liveSpecsExt';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
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

    const [updateStep, updateContext, nextStep, context] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.nextStep,
            state.context,
        ]);

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const updateMaterializationTimestamp = async () => {
                const liveSpecResponse = await getLiveSpecSpec(
                    context.backfillTarget.id
                );

                if (liveSpecResponse.error) {
                    updateStep(stepIndex, {
                        error: liveSpecResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                const draftsResponse = await createEntityDraft(
                    `data flow backfill : ${context.backfillTarget.catalog_name} : create : someKeyGoesHere`
                );
                const backfilledDraftId = draftsResponse.data?.[0].id;

                if (draftsResponse.error || !backfilledDraftId) {
                    updateStep(stepIndex, {
                        error: draftsResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateContext({
                    backfilledDraftId,
                });

                // Update the spec here
                const updatedSpec = {
                    ...liveSpecResponse.data.spec,
                };
                updatedSpec.bindings.forEach((binding: any) => {
                    if (
                        collectionsBeingBackfilled.includes(
                            getCollectionName(binding)
                        )
                    ) {
                        binding.source = getBindingAsFullSource(binding);
                        binding.source.notBefore = context.timeStopped;
                    }
                });

                const draftedMaterialization = await createDraftSpec(
                    backfilledDraftId,
                    context.backfillTarget.catalog_name,
                    updatedSpec,
                    'materialization',
                    undefined,
                    false
                );
                // const draftedMaterialization = await modifyDraftSpec(
                //     updatedSpec,
                //     {
                //         catalog_name: context.backfillTarget.catalog_name,
                //         draft_id: backfilledDraftId,
                //         spec_type: 'materialization',
                //     },
                //     undefined,
                //     undefined,
                //     `data flow backfill : ${context.backfillTarget.catalog_name} : update : someKeyGoesHere`
                // );

                if (draftedMaterialization.error) {
                    updateStep(stepIndex, {
                        error: draftedMaterialization.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateStep(stepIndex, {
                    progress: ProgressStates.SUCCESS,
                    valid: true,
                });

                nextStep();
            };

            void updateMaterializationTimestamp();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    return (
        <>explain what is happening</>
        // <Logs
        //     token={logsToken}
        //     height={350}
        //     loadingLineSeverity="info"
        //     spinnerMessages={{
        //         stoppedKey: 'preSavePrompt.logs.spinner.stopped',
        //         runningKey: 'preSavePrompt.logs.spinner.running',
        //     }}
        // />
    );
}

export default MarkMaterialization;
