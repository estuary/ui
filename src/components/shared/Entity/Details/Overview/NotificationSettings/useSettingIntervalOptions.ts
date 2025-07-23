import { useMemo } from 'react';

import { useIntl } from 'react-intl';

interface IntervalOptions {
    [interval: string]: string;
}

const intervalOptionIds = {
    hour: {
        id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.hour',
    },
    day: {
        id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.day',
    },
};

function useSettingIntervalOptions() {
    const intl = useIntl();

    // The keys of the object below are based on the returned, postgresql interval values.
    // A postgresql interval in hour increments has the following format: 'HH:00:00'
    // while a postgresql interval in day increments has the following format: '# day(s)'.
    const options: IntervalOptions = useMemo(
        () => ({
            '7 days': intl.formatMessage(intervalOptionIds.day, {
                interval: 7,
            }),
            '3 days': intl.formatMessage(intervalOptionIds.day, {
                interval: 3,
            }),
            '2 days': intl.formatMessage(intervalOptionIds.day, {
                interval: 2,
            }),
            '24:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 24,
            }),
            '12:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 12,
            }),
            '08:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 8,
            }),
            '04:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 4,
            }),
            '02:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 2,
            }),
            '01:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 1,
            }),
            'none': intl.formatMessage({
                id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.unsetOption',
            }),
        }),
        [intl]
    );

    return { options };
}

export default useSettingIntervalOptions;
