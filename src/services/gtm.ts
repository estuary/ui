import ReactGA from 'react-ga';
import { getGoogleTageManagerSettings, isProduction } from 'utils/env-utils';

const googleTagManagerSettings = getGoogleTageManagerSettings();

export const initGoogleTagManager = () => {
    if (
        isProduction &&
        googleTagManagerSettings.enabled &&
        googleTagManagerSettings.id
    ) {
        ReactGA.initialize(googleTagManagerSettings.id, {
            debug: true,
        });
    }
};
