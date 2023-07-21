import { Schema } from 'types';
import TagManager from 'react-gtm-module';

import { getGoogleTageManagerSettings, isProduction } from 'utils/env-utils';

const googleTagManagerSettings = getGoogleTageManagerSettings();

type EVENTS = 'Register';

export const initGoogleTagManager = () => {
    if (
        isProduction &&
        googleTagManagerSettings.enabled &&
        googleTagManagerSettings.id
    ) {
        TagManager.initialize({ gtmId: googleTagManagerSettings.id });
    }
};

export const fireGtmEvent = (event: EVENTS, data: Schema | undefined = {}) => {
    if (
        isProduction &&
        googleTagManagerSettings.enabled &&
        googleTagManagerSettings.id
    ) {
        TagManager.dataLayer({
            dataLayer: {
                ...data,
                event,
            },
        });
    }
};
