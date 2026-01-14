import type { Schema } from 'src/types';

import { posthogCapture } from 'src/services/posthog';
import { getGoogleTageManagerSettings } from 'src/utils/env-utils';

// GTM is loaded/initialized in index.html

type EVENTS =
    | 'Connector_Search'
    | 'Register'
    | 'RegisterFailed'
    | 'Payment_Entered'

    // For Google these are fired from TagManager
    | 'test_click'
    | 'save_and_publish_click';

const { allowedToRun } = getGoogleTageManagerSettings();

export const fireGtmEvent = (event: EVENTS, data: Schema | undefined = {}) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({
            event,
            ...data,
        });
    }

    posthogCapture(event, data);
};

export const setGtmData = (data?: Schema) => {
    if (allowedToRun) {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(data);
    }
};
