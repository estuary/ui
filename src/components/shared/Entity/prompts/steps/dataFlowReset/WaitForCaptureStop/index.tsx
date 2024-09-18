import { getLiveSpecIdByPublication } from 'api/publicationSpecsExt';
import { useEditorStore_catalogName } from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function WaitForCaptureStop() {
    const catalogName = useEditorStore_catalogName();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [context, updateStep, updateContext, nextStep] =
        usePreSavePromptStore((state) => [
            state.context,
            state.updateStep,
            state.updateContext,
            state.nextStep,
        ]);

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const waitForSpecToFullyStop = async () => {
                const liveSpecResponse = await getLiveSpecIdByPublication(
                    context.pubId,
                    catalogName
                );

                const liveSpecId = liveSpecResponse.data?.[0].live_spec_id;

                if (liveSpecResponse.error || !liveSpecId) {
                    updateStep(stepIndex, {
                        error: liveSpecResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                // TODO (data flow) this needs to actually fetch the time for this
                // Start calling for shards
                // Loop over it until we see nothing is coming
                // Snag time
                updateContext({
                    liveSpecId,
                    timeStopped: '01/01/2024',
                });

                updateStep(stepIndex, {
                    valid: true,
                });

                // Fake timeout to make it feel more async
                setTimeout(() => {
                    nextStep();
                }, 1000);
            };

            void waitForSpecToFullyStop();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    return (
        <>explain what is happening context.liveSpecId = {context.liveSpecId}</>
    );
}

export default WaitForCaptureStop;
