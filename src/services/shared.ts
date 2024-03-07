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

    if (process.env.NODE_ENV === 'development') {
        console.log(event, eventProperties);
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

export const FAILED_TO_FETCH = 'FAILED TO FETCH';
export const RESPONSE_JSON_NOT_FN = 'RESPONSE.JSON IS NOT A FUNCTION';
export const STATEMENT_TIMEOUT = 'STATEMENT TIMEOUT';
export const FETCH_DEFAULT_ERROR = 'Server Error';

export const RETRY_REASONS = [
    FAILED_TO_FETCH,
    STATEMENT_TIMEOUT,
    FETCH_DEFAULT_ERROR,
];
export const NETWORK_ERRORS = [FAILED_TO_FETCH, RESPONSE_JSON_NOT_FN];

export const checkErrorMessage = (
    checkingFor: string,
    message?: string | null | undefined
) =>
    message ? message.toUpperCase().includes(checkingFor.toUpperCase()) : false;

export const retryAfterFailure = (message?: string | null | undefined) =>
    RETRY_REASONS.some((el) => checkErrorMessage(el, message));

export const showAsTechnicalDifficulties = (
    message?: string | null | undefined
) => NETWORK_ERRORS.some((el) => checkErrorMessage(el, message));
