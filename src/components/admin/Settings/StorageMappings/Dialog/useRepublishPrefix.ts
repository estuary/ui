import { PublicationJobStatus, getPublicationById } from 'api/publications';
import { republishPrefix } from 'api/storageMappings';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { handleFailure, handleSuccess, supabaseRetry } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { hasLength } from 'utils/misc-utils';
import { useStorageMappingStore } from '../Store/create';

function useRepublishPrefix() {
    const intl = useIntl();
    const { jobStatusPoller } = useJobStatusPoller();

    const setPubId = useStorageMappingStore((state) => state.setPubId);
    const setLogToken = useStorageMappingStore((state) => state.setLogToken);
    const setSaving = useStorageMappingStore((state) => state.setSaving);
    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );

    return useCallback(
        async (prefix: string) => {
            const republicationResponse = await republishPrefix(prefix);

            if (republicationResponse.error) {
                setSaving(false);
                setServerError(republicationResponse.error);

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED, {
                    response: republicationResponse,
                });

                return;
            }

            if (!hasLength(republicationResponse.data)) {
                setSaving(false);
                setServerError(
                    intl.formatMessage({
                        id: 'storageMappings.dialog.generate.error.unableToFetchLogs',
                    })
                );

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED, {
                    context: 'A publication ID was not found in the response.',
                });

                return;
            }

            const evaluatedPubId = republicationResponse.data;
            setPubId(evaluatedPubId);

            const publicationResponse = await supabaseRetry(
                () => getPublicationById(evaluatedPubId),
                'getPublicationById'
            ).then(handleSuccess<PublicationJobStatus[]>, handleFailure);

            if (publicationResponse.error || !publicationResponse.data) {
                setSaving(false);
                setServerError(
                    intl.formatMessage({
                        id: 'storageMappings.dialog.generate.error.unableToFetchLogs',
                    })
                );

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED, {
                    context: 'An error was encountered fetching the log token.',
                });

                return;
            }

            setLogToken(publicationResponse.data[0].logs_token);

            jobStatusPoller(
                getPublicationById(evaluatedPubId),
                async () => {
                    setSaving(false);
                    setServerError(null);
                },
                async (payload: any) => {
                    setSaving(false);
                    setServerError(
                        intl.formatMessage({
                            id: 'storageMappings.dialog.generate.error.republicationFailed',
                        })
                    );

                    logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED, {
                        response: payload,
                        context:
                            'An error was encountered polling for the publication job status.',
                    });
                }
            );
        },
        [
            intl,
            jobStatusPoller,
            setLogToken,
            setPubId,
            setSaving,
            setServerError,
        ]
    );
}

export default useRepublishPrefix;
