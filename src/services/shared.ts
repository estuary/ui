import LogRocket from 'logrocket';
import { CustomEvents } from './types';

export const logRocketEvent = (
    event: CustomEvents | string,
    eventProperties?: any
) => {
    // Just want to be very very safe
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (LogRocket?.track) {
        LogRocket.track(event, eventProperties);
    }
};
