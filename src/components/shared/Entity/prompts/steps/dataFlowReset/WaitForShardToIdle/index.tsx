import { getLiveSpecIdByPublication } from 'api/publicationSpecsExt';
import { useEditorStore_catalogName } from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { DateTime } from 'luxon';
import { useUserStore } from 'context/User/useUserContextStore';
import { fetchShardList } from 'utils/dataPlane-utils';
import { useQueryPoller } from 'hooks/useJobStatusPoller';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useIntl } from 'react-intl';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function WaitForShardToIdle() {
    const intl = useIntl();
    const session = useUserStore((state) => state.session);

    const queryPoller = useQueryPoller(
        'WaitForShardToIdle',
        (response: { shards?: Shard[] }) => {
            // default to `null` so the poller will keep checking
            let status = null;

            if (response.shards && response.shards.length > 0) {
                // We have shards so we need to look through all the statuses
                //  and check if they are IDLE. Otherwise leave the status as
                //  null so the poller keeps running

                // TODO (data flow backfill)
                //  Add support for showing status to user so they understand
                //      why they might be sitting around and waiting.
                const allShardsIdle = response.shards.every((shard) => {
                    return Boolean(
                        shard.status.length === 0 ||
                            shard.status
                                .map(({ code }) => code)
                                .every((code) => code === 'IDLE')
                    );
                });

                if (allShardsIdle) {
                    status = true;
                }
            }

            return [status, response];
        }
    );

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
                    context.initialPubId,
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

                updateContext({
                    liveSpecId,
                });

                updateStep(stepIndex, {
                    optionalLabel: intl.formatMessage({ id: 'common.waiting' }),
                });

                queryPoller(
                    () => fetchShardList(catalogName, session),
                    async () => {
                        const currentTimeUTC = DateTime.utc();
                        const timeStopped = currentTimeUTC.toFormat(
                            `yyyy-MM-dd'T'HH:mm:ss'Z'`
                        );

                        updateContext({
                            timeStopped,
                        });

                        updateStep(stepIndex, {
                            progress: ProgressStates.SUCCESS,
                            optionalLabel: intl.formatMessage(
                                {
                                    id: 'dataFlowReset.waitForShardToIdle.success',
                                },
                                {
                                    timeStopped: `${currentTimeUTC.toLocaleString(
                                        DateTime.TIME_WITH_SECONDS
                                    )}`,
                                }
                            ),
                            valid: true,
                        });

                        nextStep();
                    },
                    async (
                        failedResponse: any //PublicationJobStatus | PostgrestError
                    ) => {
                        updateStep(stepIndex, {
                            valid: false,
                            error: failedResponse.error ? failedResponse : null,
                            publicationStatus: !failedResponse.error
                                ? failedResponse
                                : null,
                        });
                        // logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                    },
                    2500
                );
            };

            void waitForSpecToFullyStop();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default WaitForShardToIdle;
