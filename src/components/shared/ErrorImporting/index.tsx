import type { FallbackProps } from 'react-error-boundary';
import type { LazyLoadFailureStates } from 'src/components/shared/ErrorImporting/types';

import { useEffect, useState } from 'react';

import { getWithExpiry, setWithExpiry } from 'src/_compliance/shared';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import Error from 'src/components/shared/Error';
import {
    failedToLazyLoad,
    logRocketConsole,
    logRocketEvent,
} from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

export function ErrorImporting({ error }: FallbackProps) {
    const [stopTrying, setStopTrying] = useState(false);

    // TODO (error importing) get rid of this logging.
    //  Keep an eye on the error so we know the list for
    //  failedToLazyLoad is valid.
    logRocketConsole('ErrorImporting: error', error);

    useEffect(() => {
        if (error?.message && failedToLazyLoad(error.message)) {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');

            // If we already tried and are hitting the error again
            //  just show the error and clear the local storage
            if (
                getWithExpiry<LazyLoadFailureStates>(
                    LocalStorageKeys.LAZY_LOAD_FAILED_KEY
                ) === 'reloaded'
            ) {
                logRocketEvent(CustomEvents.LAZY_LOADING, 'stopped');
                setStopTrying(true);
                setWithExpiry<LazyLoadFailureStates>(
                    LocalStorageKeys.LAZY_LOAD_FAILED_KEY,
                    null,
                    null
                );
                return;
            }

            // Update LR and the token
            logRocketEvent(CustomEvents.LAZY_LOADING, 'reloaded');
            setWithExpiry<LazyLoadFailureStates>(
                LocalStorageKeys.LAZY_LOAD_FAILED_KEY,
                'reloaded',
                null
            );

            // Wait just a bit before reloading incase there was a network blip
            setTimeout(() => window.location.reload(), 250);
        }
    }, [error]);

    if (stopTrying) {
        return <Error error={error} condensed />;
    }

    return <FullPageSpinner />;
}
