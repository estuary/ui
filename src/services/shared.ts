import { isProduction } from 'utils/env-utils';
import { CustomEvents } from './types';

export const logRocketEvent = (
    event: CustomEvents | string,
    eventProperties?: any
) => {
    // Just want to be very very safe
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.LogRocket?.track) {
        window.LogRocket.track(event, eventProperties);
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(event, eventProperties);
    }
};

export const logRocketConsole = (message: string, ...props: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.LogRocket?.log) {
        window.LogRocket.log(message, props);
    }

    if (!isProduction) {
        console.log(message, props);
    }
};

export const FAILED_TO_FETCH = 'failed to fetch';
export const RETRY_REASONS = [FAILED_TO_FETCH];

export const retryAfterFailure = (message?: string | null | undefined) =>
    RETRY_REASONS.some((el) => message?.toLowerCase().includes(el));
