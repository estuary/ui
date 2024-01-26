import FullPageSpinner from 'components/fullPage/Spinner';
import { lazy } from 'react';
import { logRocketConsole, logRocketEvent } from './shared';
import { CustomEvents } from './types';

const handledLazy = (factory: () => Promise<{ default: any }>) => {
    return lazy(() =>
        factory().catch((error) => {
            logRocketEvent(CustomEvents.LAZY_LOADING, 'failed');
            logRocketConsole('Component Failed Loading:', error);

            // Since we cannot fetch what we want go ahead and reload the apge
            window.location.reload();

            return { default: FullPageSpinner };
        })
    );
};

export { handledLazy };
