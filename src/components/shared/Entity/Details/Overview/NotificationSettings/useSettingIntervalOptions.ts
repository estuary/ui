import { useMemo } from 'react';

interface IntervalOptions {
    [interval: string]: string;
}

function useSettingIntervalOptions() {
    // The keys of the object below are based on the returned, postgresql interval values.
    // A postgresql interval in hour increments has the following format: 'HH:00:00'
    // while a postgresql interval in day increments has the following format: '# day(s)'.
    const options: IntervalOptions = useMemo(
        () => ({
            '7 days': '7 Days',
            '3 days': '3 Days',
            '2 days': '2 Days',
            '24:00:00': '24 Hours',
            '12:00:00': '12 Hours',
            '08:00:00': '8 Hours',
            '04:00:00': '4 Hours',
            '02:00:00': '2 Hours',
            '01:00:00': '1 Hour',
            'none': 'None',
        }),
        []
    );

    return { options };
}

export default useSettingIntervalOptions;
