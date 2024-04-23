import { getPublicationById } from 'api/publications';
import { republishPrefix } from 'api/storageMappings';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { JOB_STATUS_COLUMNS, TABLES, supabaseClient } from 'services/supabase';
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

                return;
            }

            if (!hasLength(republicationResponse.data)) {
                console.log('ERROR : Publication ID not found');

                setSaving(false);
                setServerError(
                    intl.formatMessage({
                        id: 'storageMappings.dialog.generate.error.unableToFetchLogs',
                    })
                );

                return;
            }

            const evaluatedPubId = republicationResponse.data;
            setPubId(evaluatedPubId);

            const publicationResponse = await getPublicationById(
                evaluatedPubId
            );

            if (publicationResponse.error || !publicationResponse.data) {
                console.log('ERROR : Fetch log token', publicationResponse);

                setSaving(false);
                setServerError(
                    intl.formatMessage({
                        id: 'storageMappings.dialog.generate.error.unableToFetchLogs',
                    })
                );

                return;
            }

            setLogToken(publicationResponse.data[0].logs_token);

            jobStatusPoller(
                supabaseClient
                    .from(TABLES.PUBLICATIONS)
                    .select(JOB_STATUS_COLUMNS)
                    .eq('id', evaluatedPubId),
                async () => {
                    setSaving(false);
                    setServerError(null);
                },
                async (payload: any) => {
                    console.log('ERROR : Polling publication', payload);

                    setSaving(false);
                    setServerError(
                        intl.formatMessage({
                            id: 'storageMappings.dialog.generate.error.republicationFailed',
                        })
                    );
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
