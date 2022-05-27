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

const MASKED = '**MASKED**';

const logRocketSettings = getLogRocketSettings();

// More info about the dom settings
//  https://docs.logrocket.com/reference/dom
export const initLogRocket = () => {
    if (isProduction() && logRocketSettings.appID) {
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
                    response.body = MASKED;
                    return response;
                };
            }

            if (logRocketSettings.sanitize.request) {
                settings.network.requestSanitizer = (request: any) => {
                    if (request.headers.apikey) {
                        request.headers.apikey = MASKED;
                    }

                    if (request.headers.Authorization) {
                        request.headers.Authorization = MASKED;
                    }

                    request.body = MASKED;
                    return request;
                };
            }
        }

        LogRocket.init(logRocketSettings.appID, settings);
        setupLogRocketReact(LogRocket);
    }
};

export const identifyUser = (user: User) => {
    if (
        isProduction() &&
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
