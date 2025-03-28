import { createPublication } from 'src/api/publications';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import { useEffect } from 'react';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import usePublicationHandler from 'src/hooks/prompts/usePublicationHandler';
import useStepIsIdle from 'src/hooks/prompts/useStepIsIdle';
import useCheckPublicationForIncompatibleCollections from 'src/hooks/prompts/useCheckPublicationForIncompatibleCollections';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function PublishStepDataFlowReset() {
    const publicationHandler = usePublicationHandler();
    const checkPublicationForIncompatibleCollections =
        useCheckPublicationForIncompatibleCollections();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName.whole
    );

    const stepIndex = useLoopIndex();
    const stepIsIdle = useStepIsIdle();
    const [updateStep, updateContext, initUUID, dataFlowResetDraftId] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.initUUID,
            state.context.dataFlowResetDraftId,
        ]);

    useEffect(() => {
        if (!stepIsIdle) {
            return;
        }
        updateStep(stepIndex, {
            progress: ProgressStates.RUNNING,
        });

        const saveAndPublish = async () => {
            // Start publishing it
            const publishResponse = await createPublication(
                dataFlowResetDraftId,
                false,
                `${CustomEvents.DATA_FLOW_RESET} : publish : ${initUUID}`,
                dataPlaneName
            );

            if (publishResponse.error || !publishResponse.data) {
                updateStep(stepIndex, {
                    error: publishResponse.error,
                    progress: ProgressStates.FAILED,
                    allowRetry: true,
                });
                return;
            }

            updateContext({
                dataFlowResetPudId: publishResponse.data[0].id,
            });

            publicationHandler(publishResponse.data[0].id, (response) => {
                checkPublicationForIncompatibleCollections(
                    response,
                    'resetDataFlow.disableCapture.errors.incompatibleCollections'
                );
            });
        };

        void saveAndPublish();
    }, [
        checkPublicationForIncompatibleCollections,
        dataFlowResetDraftId,
        dataPlaneName,
        initUUID,
        publicationHandler,
        stepIndex,
        stepIsIdle,
        updateContext,
        updateStep,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default PublishStepDataFlowReset;
