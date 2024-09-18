import { createPublication, getPublicationByIdQuery } from 'api/publications';
import Logs from 'components/logs';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useState } from 'react';
import { useMount } from 'react-use';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function Publish() {
    const [logsToken, setLogsToken] = useState(null);

    const { jobStatusPoller } = useJobStatusPoller();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, context] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.context,
    ]);

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const saveAndPublish = async () => {
                // Start publishing it
                const publishResponse = await createPublication(
                    context.backfilledDraftId,
                    false
                );

                if (publishResponse.error || !publishResponse.data) {
                    updateStep(stepIndex, {
                        error: publishResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                setLogsToken(publishResponse.data[0].logs_token);

                jobStatusPoller(
                    getPublicationByIdQuery(publishResponse.data[0].id),
                    async () => {
                        updateStep(stepIndex, {
                            progress: ProgressStates.SUCCESS,
                            valid: true,
                        });

                        // nextStep();
                    },
                    async (error: any) => {
                        updateStep(stepIndex, {
                            error,
                            progress: ProgressStates.FAILED,
                            valid: false,
                        });
                        // logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                    }
                );
            };

            void saveAndPublish();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    return (
        <>
            explain what is happening
            <Logs
                token={logsToken}
                height={350}
                loadingLineSeverity="info"
                spinnerMessages={{
                    stoppedKey: 'preSavePrompt.logs.spinner.stopped',
                    runningKey: 'preSavePrompt.logs.spinner.running',
                }}
            />
        </>
    );
}

export default Publish;
