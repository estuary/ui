import { getLiveSpecIdByPublication } from 'api/publicationSpecsExt';
import { useEditorStore_catalogName } from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { DateTime } from 'luxon';
import { useUserStore } from 'context/User/useUserContextStore';
import { fetchShardList } from 'utils/dataPlane-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function WaitForCaptureStop() {
    const session = useUserStore((state) => state.session);

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

                if (liveSpecResponse.error || !liveSpecId || !session) {
                    updateStep(stepIndex, {
                        error: liveSpecResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                const foo = await fetchShardList(catalogName, session);

                console.log('fetchShardList', foo);

                // TODO (data flow) this needs to actually fetch the time for this
                // Start calling for shards
                // Loop over it until we see nothing is coming
                // Snag time

                const timeStopped = DateTime.utc().toFormat(
                    `yyyy-MM-dd'T'HH:mm:ss'Z'`
                );
                updateContext({
                    liveSpecId,
                    timeStopped,
                });

                // Fake timeout to make it feel more async
                setTimeout(() => {
                    updateStep(stepIndex, {
                        valid: true,
                    });
                    nextStep();
                }, 1000);
            };

            void waitForSpecToFullyStop();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default WaitForCaptureStop;
