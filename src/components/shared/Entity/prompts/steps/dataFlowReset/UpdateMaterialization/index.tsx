import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByLiveSpecId } from 'api/liveSpecsExt';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function MarkMaterialization() {
    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

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
                const liveSpecResponse = await getLiveSpecsByLiveSpecId(
                    context.liveSpecId
                );

                const catalogName = liveSpecResponse.data?.[0].catalog_name;

                if (liveSpecResponse.error || !catalogName) {
                    updateStep(stepIndex, {
                        error: liveSpecResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                const draftsResponse = await createEntityDraft(catalogName);
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
                    ...liveSpecResponse.data?.[0].spec,
                };

                const draftedMaterialization = await createDraftSpec(
                    backfilledDraftId,
                    catalogName,
                    updatedSpec,
                    'materialization'
                );

                if (draftedMaterialization.error) {
                    updateStep(stepIndex, {
                        error: draftedMaterialization.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

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
