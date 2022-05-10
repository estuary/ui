import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { getLogRocketSettings } from 'utils/env-utils';

if (
    !process.env.REACT_APP_SUPABASE_URL ||
    !process.env.REACT_APP_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

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

export const identifyUser = (userID: string, name: string, email: string) => {
    if (logRocketSettings.idUser.enabled) {
        const traits = {} as IUserTraits;

        if (logRocketSettings.idUser.includeName) {
            traits.name = name;
        }

        if (logRocketSettings.idUser.includeEmail) {
            traits.email = email;
        }

        LogRocket.identify(userID, traits);
    }
};
