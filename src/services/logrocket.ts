import { User } from '@supabase/supabase-js';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { getUserDetails } from 'services/supabase';
import { getLogRocketSettings } from 'utils/env-utils';

// Based on node_modules/logrocket/dist/types.d.ts
interface IUserTraits {
    [propName: string]: string | number | boolean;
}

const logRocketSettings = getLogRocketSettings();

export const initLogRocket = () => {
    if (logRocketSettings.appID) {
        LogRocket.init(logRocketSettings.appID, {
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
