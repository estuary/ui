import { User } from '@supabase/supabase-js';
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
    WS_SUB = 'Supabase_Subscription',
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

const maskBodyKeys = ['endpoint_config'];
const maskHeaderKeys = ['apikey', 'Authorization'];
const maskKeysInObject = (
    keys: typeof maskBodyKeys | typeof maskHeaderKeys,
    obj: [{ [k: string]: any }] | { [k: string]: any } | undefined
) => {
    if (!obj) return obj;

    const originalIsArray = Array.isArray(obj);
    const response = originalIsArray ? obj : [obj];

    response.forEach((el) => {
        keys.forEach((key) => {
            if (el[key]) {
                el[key] = MASKED;
            }
        });
    });

    return originalIsArray ? response : response[0];
};

const parseBody = (body: any) => {
    let formattedContent;

    if (typeof body === 'string') {
        try {
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

    requestResponse.body = maskKeysInObject(
        maskBodyKeys,
        parseBody(requestResponse.body)
    );

    if (requestResponse?.headers) {
        requestResponse.headers = maskKeysInObject(
            maskHeaderKeys,
            requestResponse.headers
        );
    }

    return requestResponse;
};

// More info about the dom settings
//  https://docs.logrocket.com/reference/dom
export const initLogRocket = () => {
    if (!isProduction && logRocketSettings.appID) {
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
