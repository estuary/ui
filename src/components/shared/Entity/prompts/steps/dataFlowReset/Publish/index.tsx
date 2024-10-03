import { createPublication } from 'api/publications';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useEffect } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { hasLength } from 'utils/misc-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import usePublicationHandler from '../../usePublicationHandler';
import useStepIsIdle from '../../useStepIsIdle';

function PublishStepDataFlowReset() {
    const publicationHandler = usePublicationHandler();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
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
                dataFlowResetPudId: publishResponse.data[0].id,
            });

            publicationHandler(publishResponse.data[0].id, (response) => {
                const hasIncompatibleCollections = hasLength(
                    response?.job_status?.incompatible_collections
                );

                // If we hit this basically just stop everything and tell the user
                if (hasIncompatibleCollections) {
                    updateStep(stepIndex, {
                        allowRetry: false,
                        error: {
                            message:
                                'resetDataFlow.errors.incompatibleCollections',
                        },
                    });

                    logRocketEvent(CustomEvents.DATA_FLOW_RESET, {
                        incompatibleCollections: true,
                    });
                }
            });
        };

        void saveAndPublish();
    }, [
        dataFlowResetDraftId,
        dataPlaneName?.whole,
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
