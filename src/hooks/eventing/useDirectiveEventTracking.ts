import type { UserClaims } from 'src/directives/types';
import type { AppliedDirective } from 'src/types';

import { useCallback } from 'react';

import { usePostHog } from '@posthog/react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const useDirectiveEventTracking = () => {
    const postHog = usePostHog();

    return useCallback(
        (eventName: string, directive?: AppliedDirective<UserClaims>) => {
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

            logRocketEvent(
                `${CustomEvents.DIRECTIVE}:${eventName}`,
                properties
            );

            // Two changes for PH:
            //  1 - we do not send all the data over
            //  2 - we do not include the `directive` part of the event name as that feels "leaky"
            postHog?.capture(eventName, {
                status: properties.status,
            });
        },
        [postHog]
    );
};

export default useDirectiveEventTracking;
