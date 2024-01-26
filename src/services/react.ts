import MustReloadErrorDialog from 'components/shared/ErrorDialog/MustReload';
import { lazy } from 'react';
import { logRocketConsole, logRocketEvent } from './shared';
import { CustomEvents } from './types';

const handledLazy = (factory: () => Promise<{ default: any }>) => {
    return lazy(() =>
        factory().catch((error) => {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');
            logRocketConsole('Component Failed Loading:', error);

            return { default: MustReloadErrorDialog };
        })
    );
};

export { handledLazy };
