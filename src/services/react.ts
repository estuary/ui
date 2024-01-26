import FullPageSpinner from 'components/fullPage/Spinner';
import { lazy } from 'react';
import { logRocketConsole, logRocketEvent } from './shared';
import { CustomEvents } from './types';

const LAZY_LOAD_FAILED_KEY = 'chunk_failed';

// https://mitchgavan.com/code-splitting-react-safely/
const setWithExpiry = (key: string, value: string, ttl: number) => {
    const item = {
        value,
        expiry: new Date().getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

const getWithExpiry = (key: string) => {
    const itemString = window.localStorage.getItem(key);
    const item = itemString ? JSON.parse(itemString) : null;

    if (item === null) {
        return null;
    }

    // We have waited long enough to allow trying again so clearing out the key
    if (new Date().getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    // Return value so we do not try reloading again
    return item.value;
};

const handledLazy = (factory: () => Promise<{ default: any }>) => {
    return lazy(() =>
        factory().catch((error) => {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');
            logRocketConsole('Component Failed Loading 1:', error);

            // Check if we're in an infinite loading loop before trying again
            if (!getWithExpiry(LAZY_LOAD_FAILED_KEY)) {
                setWithExpiry(LAZY_LOAD_FAILED_KEY, 'true', 10000);
                window.location.reload();
            }

            // Still make sure to return something so the app does not blow up
            return { default: FullPageSpinner };
        })
    );
};

export { handledLazy };
