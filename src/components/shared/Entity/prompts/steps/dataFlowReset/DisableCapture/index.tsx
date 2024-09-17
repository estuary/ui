import { modifyDraftSpec } from 'api/draftSpecs';
import { createPublication, getPublicationByIdQuery } from 'api/publications';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useMount } from 'react-use';
import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import { StepComponentProps } from '../../../types';

function DisableCapture({ stepIndex }: StepComponentProps) {
    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const { jobStatusPoller } = useJobStatusPoller();

    const thisStep = usePreSavePromptStore((state) => state.steps?.[stepIndex]);

    const [updateStep, nextStep] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.nextStep,
    ]);

    useMount(() => {
        if (thisStep?.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const foo = async () => {
                // Update the Capture to be disabled
                const updateResponse = await modifyDraftSpec(
                    generateDisabledSpec(draftSpecs[0].spec, false, false),
                    {
                        draft_id: draftId,
                        catalog_name: draftSpecs[0].catalog_name,
                        spec_type: 'capture',
                    }
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                // Start publishing it
                const publishResponse = await createPublication(draftId, false);

                if (publishResponse.error || !publishResponse.data) {
                    updateStep(stepIndex, {
                        error: publishResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateStep(stepIndex, {
                    logsToken: publishResponse.data[0].logs_token,
                });

                jobStatusPoller(
                    getPublicationByIdQuery(publishResponse.data[0].id),
                    async () => {
                        updateStep(stepIndex, {
                            progress: ProgressStates.SUCCESS,
                            valid: true,
                        });

                        nextStep();
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

            void foo();
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

export default DisableCapture;
