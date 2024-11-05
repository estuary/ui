import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { Duration } from 'luxon';
import { CustomEvents } from 'services/types';

export function useSyncScheduleDelayWarning() {
    const intl = useIntl();

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });

    // TODO (delay warning) - we may want to add file based support
    // file based materializations (iceberg, parquet/csv sinks etc.) use a
    //  similar mechanism for commit delaying is under a different option
    return useMemo(() => {
        const syncFrequency =
            currentCatalog?.spec?.endpoint?.connector?.config?.syncSchedule
                ?.syncFrequency;

        if (syncFrequency) {
            // Upper case to match the ISO 8601 duration format AND make it
            //  safer to check the string value
            const formattedSyncFrequency = syncFrequency.toUpperCase();

            // If the requency is 0 then just show default otherwise the math and
            //  message would make no sense
            if (formattedSyncFrequency === '0S') {
                logRocketEvent(CustomEvents.SYNC_SCHEDULE, {
                    zeroSeconds: true,
                });
                return intl.formatMessage({
                    id: 'detailsPanel.graph.syncDelay.default',
                });
            }

            // The pattern we have is pretty close to ISO 8601 so
            //  preface with PT and hope it works
            const syncDuration = Duration.fromISO(
                `PT${formattedSyncFrequency}`
            );

            // If we cannot parse the duration fire event and use default message
            if (!syncDuration.isValid) {
                logRocketEvent(CustomEvents.SYNC_SCHEDULE, {
                    invalid: true,
                    frequency: syncFrequency,
                });
                return intl.formatMessage({
                    id: 'detailsPanel.graph.syncDelay.default',
                });
            }

            // Add duration to itself to double the time
            const reportingDelay = syncDuration.plus(syncDuration).toHuman();
            return intl.formatMessage(
                { id: 'detailsPanel.graph.syncDelay' },
                {
                    reportingDelay,
                }
            );
        }

        return undefined;
    }, [
        currentCatalog?.spec?.endpoint?.connector?.config?.syncSchedule
            ?.syncFrequency,
        intl,
    ]);
}
