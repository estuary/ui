import { useEffect } from 'react';

import { createPublication } from 'src/api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import usePublicationHandler from 'src/hooks/prompts/usePublicationHandler';
import useStepIsIdle from 'src/hooks/prompts/useStepIsIdle';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_setShowSavePrompt } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

function Publish() {
    const publicationHandler = usePublicationHandler();
    const draftId = useEditorStore_id();
    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName.whole
    );

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();
    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

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
                dataFlowResetDraftId: draftId,
                dataFlowResetPudId: publishResponse.data[0].id,
            });

            publicationHandler(publishResponse.data[0].id, (response) => {
                const incompatibleCollections =
                    response?.job_status?.incompatible_collections;

                // We need to close the publish and allow the user to fix the issue
                if (hasLength(incompatibleCollections)) {
                    setIncompatibleCollections(incompatibleCollections);
                    setShowSavePrompt(false);
                }
            });
        };

        void saveAndPublish();
    }, [
        dataFlowResetDraftId,
        dataPlaneName,
        draftId,
        initUUID,
        loggingEvent,
        publicationHandler,
        setIncompatibleCollections,
        setShowSavePrompt,
        stepIndex,
        stepIsIdle,
        updateContext,
        updateStep,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default Publish;
