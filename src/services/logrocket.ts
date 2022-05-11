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

const logRocketSettings = getLogRocketSettings();

// More info about the dom settings
//  https://docs.logrocket.com/reference/dom
export const initLogRocket = () => {
    if (isProduction() && logRocketSettings.appID) {
        LogRocket.init(logRocketSettings.appID, {
            release: getAppVersion(),
            dom: {
                inputSanitizer: logRocketSettings.sanitize.inputs,
                textSanitizer: logRocketSettings.sanitize.text,
            },
        });
        setupLogRocketReact(LogRocket);
    }
};

export const identifyUser = (user: User) => {
    if (logRocketSettings.idUser.enabled) {
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
