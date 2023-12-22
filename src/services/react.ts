import MustReloadDialog from 'components/shared/MustReloadDialog';
import { lazy } from 'react';
import { logRocketConsole, logRocketEvent } from './shared';
import { CustomEvents } from './types';

const handledLazy = (factory: () => Promise<{ default: any }>) => {
    return lazy(() =>
        factory().catch((error) => {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');
            logRocketConsole('Component Failed Loading:', error);

            return { default: MustReloadDialog };
        })
    );
};

export { handledLazy };
