import type { User } from '@supabase/supabase-js';

import { includeKeys } from 'filter-obj';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';

import { OAUTH_OPERATIONS } from 'src/api/shared';
import { DEFAULT_FILTER, getUserDetails } from 'src/services/shared';
import { getLogRocketSettings } from 'src/utils/env-utils';

// Based on node_modules/logrocket/dist/types.d.ts
interface IUserTraits {
    [propName: string]: string | number | boolean;
}

// TODO (typing) They have types for LR but not sure how to access them
interface Settings {
    release: any;
    dom: any;
    network?: any;
    serverURL?: any;
}

type ParsedBody = any | undefined;

const logRocketSettings = getLogRocketSettings();

export const MISSING = '**MISSING**';
export const MASKED = '**MASKED**';

// for endspoints where we want nothing ever logged
const maskEverythingURLs = [
    // When calling encryption stuff we never want to leak anything
    'config-encryption.estuary.dev',

    // Support staf make A LOT of these and we do not need them
    'auth_roles?offset',

    // We do not need to track analytics specifically
    'google.com',
    'doubleclick.net',
    'googleapis.com',
    'googletagmanager.com',
    'stripe.com',
    'stripe.network',
    'posthog.com',

    // If it is a source file we do not really care about the contents
    'static/',

    // Same as above but just for local
    'src/',
    'node_modules/',
];

const shouldMaskEverything = (url?: string) =>
    maskEverythingURLs.some((el) => url?.toLowerCase().includes(el));

const maskEverythingOperations = [OAUTH_OPERATIONS.ENCRYPT_CONFIG];
const shouldMaskEverythingInOperation = (operation?: string) =>
    maskEverythingOperations.some((el) =>
        operation?.toLowerCase().includes(el)
    );

// for endpoints where we do not want to mess with the request at all
//  These should stay in sync with what is added to the CSP policy (public/nginx.conf)
const ignoreRegEx =
    /https?:\/\/(?:[\w-]+\.)*(?:logrocket|lr-ingest|lr-in|lr-in-prod|lr-intake|intake-lr|logr-ingest)/;
const shouldIgnore = (url?: string) => ignoreRegEx.test(url ?? '');

// The headers we never want to have logged
const maskHeaderKeys = ['apikey', 'Authorization'];

//The keys in requests/responses we are okay with logging
const allowedKeys = [
    'id',
    'draft_id',
    'logs_token',
    'catalog_name',
    'capture_name',
    'object_role',
    'title',
];

// This is the main function that will go through the parsed body and handle the keys.
//      You provide a parsed body, the keys you want to process, and the action
//      'mask'   - the keys you provided will be masked out
//      'filter' - the keys you provided will be put into a new object
const processBody = (
    obj: ParsedBody,
    keys: typeof allowedKeys | typeof maskHeaderKeys,
    action: 'mask' | 'filter'
) => {
    if (!obj) return obj;

    const originalIsArray = Array.isArray(obj);
    const response: any[] = [];

    if (action === 'filter') {
        (originalIsArray ? obj : [obj]).forEach((el) => {
            const filteredBody = includeKeys(el, allowedKeys);
            response.push(filteredBody);
        });
    } else {
        // Loop through all the elements and then loop through all the keys
        //      to mask the ones that are not allowed.
        response.forEach((el) => {
            keys.forEach((key) => {
                if (el[key]) {
                    el[key] = MASKED;
                }
            });
        });
    }

    return originalIsArray ? response : response[0];
};

// Used to parse the body of a request/response. Will handle very basic use of just
//  a string or object body. To keep stuff safe if we cannot parse the string we
//  set everything to masked.
const parseBody = (body: any): ParsedBody => {
    let formattedContent;

    if (typeof body === 'string') {
        try {
            // If the body has length parse it otherwise leave it as a blank string
            formattedContent = body.length > 0 ? JSON.parse(body) : '';
        } catch (error: unknown) {
            // If the JSON messes up getting parsed just be safe and mask everything
            formattedContent = MASKED;
        }
    } else if (typeof body === 'object') {
        formattedContent = body;
    }

    return formattedContent;
};

// Go through the request and handle the skipping, masking, filtering
const maskContent = (requestResponse: any) => {
    // Sometimes we just want to pass along the content exactly as is
    if (shouldIgnore(requestResponse.url)) {
        return requestResponse;
    }

    // Sometimes we need to see if we hsould mask everything just to be safe. Things like the
    //   SOPs encryption endpoint we don't really want to accidently leak anything.
    if (shouldMaskEverything(requestResponse.url)) {
        requestResponse.body = MASKED;
    } else {
        // If we are not masking everything then we need to check if the operation being called
        //  is one that requires extra masking. This is mainly for the oauth "encrypt-config" call
        const parsedBody = parseBody(requestResponse.body);

        if (
            parsedBody &&
            typeof parsedBody !== 'string' &&
            shouldMaskEverythingInOperation(parsedBody?.operation)
        ) {
            requestResponse.body = `${MASKED}_${parsedBody?.operation}`;
        }
    }

    //  DISABLE BODY FILTERING
    //  Now that we have SOPs encryption we should be safe to not clean out the request body
    //  as the fields that need to stay private should always be encrypted
    // If there is a body filter the objecy so only specific values make it through
    // if (requestResponse?.body && !isEmpty(requestResponse.body)) {
    //     requestResponse.body = processBody(
    //         parseBody(requestResponse.body),
    //         allowedKeys,
    //         'filter'
    //     );
    // }
    //  DISABLE BODY FILTERING

    // If there are headers go ahead and mask the values.
    if (requestResponse?.headers && !isEmpty(requestResponse.headers)) {
        requestResponse.headers = processBody(
            requestResponse.headers,
            maskHeaderKeys,
            'mask'
        );
    }

    return requestResponse;
};

// More info about the dom settings
//  https://docs.logrocket.com/reference/dom
export const initLogRocket = () => {
    if (logRocketSettings?.appID) {
        const settings: Settings = {
            release: __ESTUARY_UI_COMMIT_ID__,
            dom: {
                // isEnabled: false,
                disableWebAnimations: true,
                inputSanitizer: logRocketSettings.sanitize.inputs,
                textSanitizer: logRocketSettings.sanitize.text,
                privateAttributeBlocklist: ['data-emotion'],
            },
        };

        if (logRocketSettings.serverURL) {
            settings.serverURL = logRocketSettings.serverURL;
        }

        if (
            logRocketSettings.sanitize.response ||
            logRocketSettings.sanitize.request
        ) {
            settings.network = {};
            if (logRocketSettings.sanitize.response) {
                settings.network.responseSanitizer = (response: any) =>
                    maskContent(response);
            }

            if (logRocketSettings.sanitize.request) {
                settings.network.requestSanitizer = (request: any) =>
                    maskContent(request);
            }
        }

        LogRocket.init(logRocketSettings.appID, settings);
    }
};

export const identifyUser = (user: User) => {
    if (logRocketSettings?.idUser.enabled && logRocketSettings.appID) {
        const traits = {} as IUserTraits;
        const userDetails = getUserDetails(user);

        if (logRocketSettings.idUser.includeName) {
            traits.name = userDetails?.userName ?? DEFAULT_FILTER;
        }

        if (logRocketSettings.idUser.includeEmail) {
            traits.email = userDetails?.email ?? DEFAULT_FILTER;
        }

        LogRocket.identify(user.id, traits);
    }
};
