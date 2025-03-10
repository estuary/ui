import { Schema } from 'types';
import { getGoogleTageManagerSettings } from 'utils/env-utils';

// GTM is loaded/initialized in index.html

type EVENTS = 'Connector_Search' | 'Register' | 'Payment_Entered';

const { allowedToRun } = getGoogleTageManagerSettings();

export const fireGtmEvent = (event: EVENTS, data: Schema | undefined = {}) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
            ...data,
            event,
        });
    }
};

export const setGtmData = (data?: Schema) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(data);
    }
};
