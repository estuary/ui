import LogRocket from 'logrocket';
import { isProduction } from 'utils/env-utils';
import type { CustomEvents } from './types';

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

export const logRocketEvent = (
    event: CustomEvents | string,
    eventProperties?: any
) => {
    // Just want to be very very safe
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (LogRocket?.track) {
        LogRocket.track(event, eventProperties);
    }

    logRocketConsole(`Event Logging : ${event}`, eventProperties);
};

export const FAILED_TO_FETCH = 'FAILED TO FETCH';
export const RESPONSE_JSON_NOT_FN = 'RESPONSE.JSON IS NOT A FUNCTION';
export const REQUEST_FAILED = 'REQUEST FAILED';
export const STATEMENT_TIMEOUT = 'STATEMENT TIMEOUT';
export const FETCH_DEFAULT_ERROR = 'Server Error';

// Lazy Loading Errors
export const FAILED_TO_FETCH_DYNAMIC_IMPORT =
    'FAILED TO FETCH DYNAMICALLY IMPORTED MODULE';
export const IMPORTING_SCRIPT_FAILED = 'IMPORTING A MODULE SCRIPT FAILED';
export const LOADING_CHUNK = 'LOADING CHUNK';

export const RETRY_REASONS = [
    RESPONSE_JSON_NOT_FN, // We will retry mainly due to the new reactor endpoints sometimes return this
    FAILED_TO_FETCH,
    REQUEST_FAILED,
    STATEMENT_TIMEOUT,
    FETCH_DEFAULT_ERROR,
];
export const NETWORK_ERRORS = [FAILED_TO_FETCH, RESPONSE_JSON_NOT_FN];
export const LAZY_LOAD_ERRORS = [
    FAILED_TO_FETCH_DYNAMIC_IMPORT,
    IMPORTING_SCRIPT_FAILED,
    LOADING_CHUNK,
];

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

export const failedToLazyLoad = (message?: string | null | undefined) =>
    LAZY_LOAD_ERRORS.some((el) => checkErrorMessage(el, message));
