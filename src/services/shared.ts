import LogRocket from 'logrocket';
import { isProduction } from 'utils/env-utils';
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

export const logRocketConsole = (message: string, ...props: any[]) => {
    // Just want to be very very safe
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (LogRocket?.log) {
        LogRocket.log(message, props);
    }

    if (!isProduction) {
        console.log(message, props);
    }
};

export const FAILED_TO_FETCH = 'failed to fetch';
export const RETRY_REASONS = [FAILED_TO_FETCH];

export const retryAfterFailure = (message?: string | null | undefined) =>
    RETRY_REASONS.some((el) => message?.toLowerCase().includes(el));
