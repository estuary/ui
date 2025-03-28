import { useCallback } from 'react';


import type {
    PublicationJobStatus} from 'src/api/publications';
import {
    getPublicationByIdQuery
} from 'src/api/publications';
import { republishPrefix } from 'src/api/storageMappings';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
} from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import { hasLength } from 'src/utils/misc-utils';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';

export const REPUBLICATION_FAILURE_MESSAGE_ID =
    'storageMappings.dialog.generate.error.republicationFailed';

function useRepublishPrefix() {
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

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);

                return;
            }

            if (!hasLength(republicationResponse.data)) {
                setSaving(false);
                setServerError(
                    'storageMappings.dialog.generate.error.unableToFetchLogs'
                );

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                logRocketConsole(
                    `${CustomEvents.REPUBLISH_PREFIX_FAILED}: A publication ID was not found in the response.`
                );

                return;
            }

            const evaluatedPubId = republicationResponse.data;
            setPubId(evaluatedPubId);

            const publicationResponse = await supabaseRetry(
                () => getPublicationByIdQuery(evaluatedPubId),
                'getPublicationById'
            ).then(handleSuccess<PublicationJobStatus[]>, handleFailure);

            if (publicationResponse.error || !publicationResponse.data) {
                setSaving(false);
                setServerError(
                    'storageMappings.dialog.generate.error.unableToFetchLogs'
                );

                logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                logRocketConsole(
                    `${CustomEvents.REPUBLISH_PREFIX_FAILED}: An error was encountered fetching the log token.`
                );

                return;
            }

            setLogToken(publicationResponse.data[0].logs_token);

            jobStatusPoller(
                getPublicationByIdQuery(evaluatedPubId),
                async () => {
                    setSaving(false);
                    setServerError(null);
                },
                async () => {
                    setSaving(false);
                    setServerError(REPUBLICATION_FAILURE_MESSAGE_ID);

                    logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                    logRocketConsole(
                        `${CustomEvents.REPUBLISH_PREFIX_FAILED}: An error was encountered polling for the publication job status.`
                    );
                }
            );
        },
        [jobStatusPoller, setLogToken, setPubId, setSaving, setServerError]
    );
}

export default useRepublishPrefix;
