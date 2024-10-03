import { modifyDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { CustomEvents } from 'services/types';

import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import usePublicationHandler from '../../usePublicationHandler';

function DisableCapture() {
    const intl = useIntl();

    const publicationHandler = usePublicationHandler();

    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, updateContext, initUUID, nextStep] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.initUUID,
            state.nextStep,
        ]);

    useEffect(() => {
        if (thisStep.state.progress !== ProgressStates.IDLE) {
            return;
        }
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

            updateStep(stepIndex, {
                optionalLabel: intl.formatMessage({
                    id: 'common.disabling',
                }),
            });

            publicationHandler(publishResponse.data[0].id, () => {
                updateStep(stepIndex, {
                    optionalLabel: intl.formatMessage({
                        id: 'common.disabled',
                    }),
                });

                nextStep();
            });
        };

        void disableCaptureAndPublish();
    }, [
        draftId,
        draftSpecs,
        initUUID,
        intl,
        nextStep,
        publicationHandler,
        stepIndex,
        thisStep.state.progress,
        updateContext,
        updateStep,
    ]);

    return <DraftErrors draftId={draftId} />;
}

export default DisableCapture;
