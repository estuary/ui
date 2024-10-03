import { createPublication } from 'api/publications';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useEffect } from 'react';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import usePublicationHandler from '../../usePublicationHandler';
import useStepIsIdle from '../../useStepIsIdle';

function Publish() {
    const publicationHandler = usePublicationHandler();
    const draftId = useEditorStore_id();
    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
    );

    const stepIndex = useLoopIndex();
    const stepIsIdle = useStepIsIdle();
    const [
        updateStep,
        updateContext,
        initUUID,
        dataFlowResetDraftId,
        loggingEvent,
    ] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
        state.initUUID,
        state.context.dataFlowResetDraftId,
        state.context.loggingEvent,
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
                dataFlowResetDraftId ?? draftId,
                false,
                `${loggingEvent} : publish : ${initUUID}`,
                dataPlaneName?.whole
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
                dataFlowResetDraftId: draftId,
                dataFlowResetPudId: publishResponse.data[0].id,
            });

            publicationHandler(publishResponse.data[0].id);
        };

        void saveAndPublish();
    }, [
        dataFlowResetDraftId,
        dataPlaneName?.whole,
        draftId,
        initUUID,
        loggingEvent,
        publicationHandler,
        stepIndex,
        stepIsIdle,
        updateContext,
        updateStep,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default Publish;
