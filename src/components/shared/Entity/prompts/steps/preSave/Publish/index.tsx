import {
    createPublication,
    getPublicationByIdQuery,
    PublicationJobStatus,
} from 'api/publications';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useMount } from 'react-use';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function Publish() {
    const { jobStatusPoller } = useJobStatusPoller();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, context, updateContext, initUUID] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.context,
            state.updateContext,
            state.initUUID,
        ]);

    // TODO (data flow reset) need to plumb this through correctly
    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
    );

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const saveAndPublish = async () => {
                // Start publishing it
                const publishResponse = await createPublication(
                    context.backfilledDraftId,
                    false,
                    `data flow backfill : ${context.backfillTarget.catalog_name} : publish : ${initUUID}`,
                    dataPlaneName?.whole
                );

                if (publishResponse.error || !publishResponse.data) {
                    updateStep(stepIndex, {
                        error: publishResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateContext({
                    pubId: publishResponse.data[0].id,
                });

                jobStatusPoller(
                    getPublicationByIdQuery(publishResponse.data[0].id),
                    async (successResponse: PublicationJobStatus) => {
                        updateStep(stepIndex, {
                            publicationStatus: successResponse,
                        });
                    },
                    async (
                        failedResponse: any //PublicationJobStatus | PostgrestError
                    ) => {
                        updateStep(stepIndex, {
                            error: failedResponse.error ? failedResponse : null,
                            publicationStatus: !failedResponse.error
                                ? failedResponse
                                : null,
                            progress: ProgressStates.FAILED,
                            valid: false,
                        });
                    }
                );
            };

            void saveAndPublish();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
    // <LogDialogContent
    //     spinnerMessageId="preSavePrompt.logs.spinner"
    //     severity="info"
    //     token={logsToken}
    // />
}

export default Publish;
