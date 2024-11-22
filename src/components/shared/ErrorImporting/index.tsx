import FullPageSpinner from 'components/fullPage/Spinner';
import { useEffect, useState } from 'react';
import { failedToLazyLoad, logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import Error from 'components/shared/Error';
import { FallbackProps } from 'react-error-boundary';
import { getWithExpiry, setWithExpiry } from './shared';

export function ErrorImporting({ error }: FallbackProps) {
    const [stopTrying, setStopTrying] = useState(false);

    useEffect(() => {
        if (error?.message && failedToLazyLoad(error.message)) {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');

            // If we already tried and are hitting the error again
            //  just show the error and clear the local storage
            if (getWithExpiry() === 'reloaded') {
                logRocketEvent(CustomEvents.LAZY_LOADING, 'stopped');
                setStopTrying(true);
                setWithExpiry(null);
                return;
            }

            // Update LR and the token
            logRocketEvent(CustomEvents.LAZY_LOADING, 'reloaded');
            setWithExpiry('reloaded');

            // Wait just a bit before reloading incase there was a network blip
            setTimeout(() => window.location.reload(), 250);
        }
    }, [error]);

    if (stopTrying) {
        return <Error error={error} condensed />;
    }

    return <FullPageSpinner />;
}
