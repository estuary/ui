import type { User } from '@supabase/supabase-js';
import type { CustomEvents, KnownEvents } from 'src/services/types';
import type { UserDetails } from 'src/types';

import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';

import { isProduction } from 'src/utils/env-utils';

export const DEFAULT_FILTER = '__unknown__';

export const getUserDetails = (
    user: User | null | undefined
): UserDetails | null => {
    if (!user) {
        return null;
    }

    let userName, email, emailVerified, avatar, usedSSO;

    if (!isEmpty(user.user_metadata)) {
        email = user.user_metadata.email;
        emailVerified = user.user_metadata.email_verified;
        avatar = user.user_metadata.avatar_url;
        userName = user.user_metadata.full_name ?? email;
        usedSSO = user.app_metadata.provider
            ? user.app_metadata.provider.startsWith('sso')
            : false;
    } else {
        userName = user.email;
        email = user.email;
        emailVerified = false;
        usedSSO = false;
    }

    return {
        id: user.id,
        userName,
        email,
        emailVerified,
        avatar,
        usedSSO,
    };
};

export const logRocketConsole = (message: string, ...props: any[]) => {
    LogRocket.log(message, props);

    if (!isProduction) {
        console.log(message, props);
    }
};

export const logRocketEvent = (
    // (string & {}) preserves autocomplete for CustomEvents and KnownEvents while allowing arbitrary strings
    event: CustomEvents | KnownEvents | (string & {}),
    eventProperties?: any
) => {
    // !!! NO POSTHOG TRACKING HERE !!! - this could leak confiential information
    LogRocket.track(event, eventProperties);

    logRocketConsole(`Event Logging : ${event}`, eventProperties);
};

const GRAPHQL_NETWORK_ERRORS = {
    NOT_FOUND: '[Network] Not Found',
};

export const FAILED_TO_FETCH = 'FAILED TO FETCH';
const RESPONSE_JSON_NOT_FN = 'RESPONSE.JSON IS NOT A FUNCTION';
const REQUEST_FAILED = 'REQUEST FAILED';
const STATEMENT_TIMEOUT = 'STATEMENT TIMEOUT';
export const FETCH_DEFAULT_ERROR = 'Server Error';

// Lazy Loading Errors
const FAILED_TO_FETCH_DYNAMIC_IMPORT =
    'FAILED TO FETCH DYNAMICALLY IMPORTED MODULE';
const IMPORTING_SCRIPT_FAILED = 'IMPORTING A MODULE SCRIPT FAILED';
const LOADING_CHUNK = 'LOADING CHUNK';

const RETRY_REASONS = [
    RESPONSE_JSON_NOT_FN, // We will retry mainly due to the new reactor endpoints sometimes return this
    FAILED_TO_FETCH,
    REQUEST_FAILED,
    STATEMENT_TIMEOUT,
    FETCH_DEFAULT_ERROR,
];

const NETWORK_ERRORS = [
    FAILED_TO_FETCH,
    RESPONSE_JSON_NOT_FN,
    GRAPHQL_NETWORK_ERRORS.NOT_FOUND,
];

const LAZY_LOAD_ERRORS = [
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
