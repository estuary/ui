import { Schema } from 'types';
import { getGoogleTageManagerSettings, isProduction } from 'utils/env-utils';

const googleTagManagerSettings = getGoogleTageManagerSettings();

type EVENTS = 'Connector_Search' | 'Register' | 'Payment_Entered';

// GTM is loaded/initialized in index.html

export const fireGtmEvent = (event: EVENTS, data: Schema | undefined = {}) => {
    if (
        isProduction &&
        googleTagManagerSettings.enabled &&
        googleTagManagerSettings.id
    ) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
            ...data,
            event,
        });
    }
};
