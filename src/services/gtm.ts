import TagManager from 'react-gtm-module';
import { Schema } from 'types';
import { getGoogleTageManagerSettings, isProduction } from 'utils/env-utils';

const googleTagManagerSettings = getGoogleTageManagerSettings();

type EVENTS = 'Register' | 'Payment_Entered';

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
