import { initGoogleTagManager } from 'services/gtm';
import { consentManager, grantsInterface } from 'services/tracking/consent';

const initTracking = () => {
    grantsInterface.showBanner();

    consentManager.on('update', () => {
        if (consentManager.grants.analytics) {
            initGoogleTagManager();
        }
    });
};

export { initTracking };
