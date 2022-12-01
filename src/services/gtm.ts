import TagManager from 'react-gtm-module';
import { getGoogleTageManagerSettings, isProduction } from 'utils/env-utils';

const googleTagManagerSettings = getGoogleTageManagerSettings();

export const initGoogleTagManager = () => {
    if (
        isProduction &&
        googleTagManagerSettings.enabled &&
        googleTagManagerSettings.id
    ) {
        TagManager.initialize({ gtmId: googleTagManagerSettings.id });
    }
};
