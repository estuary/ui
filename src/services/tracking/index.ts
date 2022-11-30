import { AnalyticsBrowser } from '@segment/analytics-next';
import { initGoogleTagManager } from 'services/gtm';
import { consentManager, grantsInterface } from 'services/tracking/consent';

let analytics;
const initTracking = () => {
    grantsInterface.showBanner();

    consentManager.on('update', () => {
        if (consentManager.grants.analytics) {
            initGoogleTagManager();
        }
    });

    analytics = AnalyticsBrowser.load({
        writeKey: 'rFUtDXlxITqAeBXt9OA2rKnbLrgXfV01',
    });
};

export { initTracking };
