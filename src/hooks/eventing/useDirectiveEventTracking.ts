import type { UserClaims } from 'src/directives/types';
import type { AppliedDirective } from 'src/types';

import { useCallback } from 'react';

import { usePostHog } from '@posthog/react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const useDirectiveEventTracking = () => {
    const postHog = usePostHog();

    return useCallback(
        (type: string, directive?: AppliedDirective<UserClaims>) => {
            const properties = directive
                ? {
                      id: directive.id,
                      directive_id: directive.directive_id,
                      logs_token: directive.logs_token,
                      status: directive.job_status.type,
                  }
                : {
                      status: 'incomplete',
                  };

            logRocketEvent(`${CustomEvents.DIRECTIVE}:${type}`, properties);

            postHog?.capture(type, {
                status: properties.status, // DO NOT SEND EVERYTHING TO POSTHOG
            });
        },
        [postHog]
    );
};

export default useDirectiveEventTracking;
