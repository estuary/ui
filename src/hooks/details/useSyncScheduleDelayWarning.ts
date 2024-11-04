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

    return useMemo(() => {
        const syncFrequency =
            currentCatalog?.spec?.endpoint?.connector?.config?.syncSchedule
                ?.syncFrequency;

        if (syncFrequency) {
            if (syncFrequency === '0s') {
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
                `PT${syncFrequency.toUpperCase()}`
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
