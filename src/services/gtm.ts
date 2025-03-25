import type { Schema } from 'types';
import { getGoogleTageManagerSettings } from 'utils/env-utils';

// GTM is loaded/initialized in index.html

type EVENTS =
    | 'Connector_Search'
    | 'Register'
    | 'RegisterFailed'
    | 'Payment_Entered';

const { allowedToRun } = getGoogleTageManagerSettings();

export const fireGtmEvent = (event: EVENTS, data: Schema | undefined = {}) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
            event,
            ...data,
        });
    }
};

export const setGtmData = (data?: Schema) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(data);
    }
};
