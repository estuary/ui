import { User } from '@supabase/supabase-js';
import filterObject from 'filter-obj';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { getUserDetails } from 'services/supabase';
import {
    getAppVersion,
    getLogRocketSettings,
    isProduction,
} from 'utils/env-utils';

// Based on node_modules/logrocket/dist/types.d.ts
interface IUserTraits {
    [propName: string]: string | number | boolean;
}

// TODO (typing) They have types for LR but not sure how to access them
interface Settings {
    release: any;
    dom: any;
    network?: any;
}

const logRocketSettings = getLogRocketSettings();

const MASKED = '**MASKED**';
export const MISSING = '**MISSING**';

export enum CustomEvents {
    CAPTURE_TEST = 'Capture_Test',
    CAPTURE_CREATE = 'Capture_Create',
    MATERIALIZATION_CREATE = 'Materialization_Create',
    MATERIALIZATION_TEST = 'Materialization_Test',
}

const maskEverythingURLs = ['config-encryption.estuary.dev'];
const shouldMaskEverything = (url: string) =>
    maskEverythingURLs.some((el) => url.includes(el));

const ignoreURLs = ['lr-in-prod'];
const shouldIgnore = (url: string) => ignoreURLs.some((el) => url.includes(el));

const allowedKeys = [
    'id',
    'draft_id',
    'logs_token',
    'catalog_name',
    'capture_name',
    'object_role',
    'title',
];
const maskHeaderKeys = ['apikey', 'Authorization'];

type ParsedBody = [{ [k: string]: any }] | { [k: string]: any } | undefined;

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
            const filteredBody = filterObject(el, allowedKeys);
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

const maskContent = (requestResponse: any) => {
    // Sometimes we just want to pass along the content exactly as is
    if (shouldIgnore(requestResponse.url)) {
        return requestResponse;
    }

    // Sometimes we need to see if we hsould mask everything just to be safe. Things like the
    //   SOPs encryption endpoint we don't really want to accidently leak anything.
    if (shouldMaskEverything(requestResponse.url)) {
        requestResponse.body = MASKED;
        return requestResponse;
    }

    // If there is a body filter the objecy so only specific values make it through
    if (requestResponse?.body && !isEmpty(requestResponse.body)) {
        requestResponse.body = processBody(
            parseBody(requestResponse.body),
            allowedKeys,
            'filter'
        );
    }

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
    if (isProduction && logRocketSettings.appID) {
        const settings: Settings = {
            release: getAppVersion(),
            dom: {
                inputSanitizer: logRocketSettings.sanitize.inputs,
                textSanitizer: logRocketSettings.sanitize.text,
            },
        };

        if (
            logRocketSettings.sanitize.response ||
            logRocketSettings.sanitize.request
        ) {
            settings.network = {};
            if (logRocketSettings.sanitize.response) {
                settings.network.responseSanitizer = (response: any) => {
                    return maskContent(response);
                };
            }

            if (logRocketSettings.sanitize.request) {
                settings.network.requestSanitizer = (request: any) => {
                    return maskContent(request);
                };
            }
        }

        LogRocket.init(logRocketSettings.appID, settings);
        setupLogRocketReact(LogRocket);
    }
};

export const identifyUser = (user: User) => {
    if (
        isProduction &&
        logRocketSettings.idUser.enabled &&
        logRocketSettings.appID
    ) {
        const traits = {} as IUserTraits;
        const userDetails = getUserDetails(user);

        if (logRocketSettings.idUser.includeName) {
            traits.name = userDetails.userName;
        }

        if (logRocketSettings.idUser.includeEmail) {
            traits.email = userDetails.email;
        }

        LogRocket.identify(user.id, traits);
    }
};
