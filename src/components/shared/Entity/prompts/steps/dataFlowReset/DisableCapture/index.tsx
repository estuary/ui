import { modifyDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { CustomEvents } from 'services/types';

import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import usePublicationHandler from '../../usePublicationHandler';

function DisableCapture() {
    const publicationHandler = usePublicationHandler();

    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, updateContext, initUUID] = usePreSavePromptStore(
        (state) => [state.updateStep, state.updateContext, state.initUUID]
    );

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            updateContext({
                disableClose: true,
            });

            const disableCaptureAndPublish = async () => {
                const newSpec = generateDisabledSpec(
                    draftSpecs[0].spec,
                    false,
                    false
                );

                const captureName = draftSpecs[0].catalog_name;

                // Update the Capture to be disabled
                const updateResponse = await modifyDraftSpec(
                    newSpec,
                    {
                        draft_id: draftId,
                        catalog_name: captureName,
                        spec_type: 'capture',
                    },
                    undefined,
                    undefined,
                    `${CustomEvents.DATA_FLOW_RESET} : disable capture : ${initUUID}`
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                // Start publishing it
                const publishResponse = await createPublication(
                    draftId,
                    false,
                    `${CustomEvents.DATA_FLOW_RESET} : disable capture : ${initUUID}`
                );

                if (publishResponse.error || !publishResponse.data) {
                    updateStep(stepIndex, {
                        error: publishResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateContext({
                    captureName,
                    captureSpec: newSpec,
                    initialPubId: publishResponse.data[0].id,
                });

                publicationHandler(publishResponse.data[0].id, true);
            };

            void disableCaptureAndPublish();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    return <DraftErrors draftId={draftId} />;
}

export default DisableCapture;
