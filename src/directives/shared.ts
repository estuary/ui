import type {
    Directives,
    JobStatusQueryData,
    UserClaims,
} from 'src/directives/types';
import type { AppliedDirective } from 'src/types';

import { isEmpty } from 'lodash';

import { supabaseClient } from 'src/context/GlobalProviders';
import { JOB_STATUS_COLUMNS, TABLES } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

export const jobStatusQuery = (data: JobStatusQueryData) => {
    return supabaseClient
        .from(TABLES.APPLIED_DIRECTIVES)
        .select(JOB_STATUS_COLUMNS)
        .match({
            logs_token: data.logs_token,
            directive_id: data.directive_id,
            id: data.id,
        })
        .returns<AppliedDirective<UserClaims>>();
};

export const DIRECTIVES: Directives = {
    acceptDemoTenant: {
        token: '14c0beec-422f-4e95-94f1-567107b26840',
        queryFilter: (queryBuilder) => {
            return queryBuilder;
        },
        generateUserClaim: (args: any[]) => {
            return {
                tenant: args[0],
            };
        },
        calculateStatus: (appliedDirective) => {
            const stillNeeded = () => {
                return !hasLength(appliedDirective?.user_claims?.tenant);
            };

            // If there is no directive to check it is unfulfilled
            if (!appliedDirective || isEmpty(appliedDirective)) {
                return 'unfulfilled';
            }

            // If directive already queued and no claim is there we can just use that directive again
            if (appliedDirective.job_status.type === 'queued') {
                // no claim is there we can just use that directive again
                if (stillNeeded()) {
                    return 'in progress';
                }

                // queued claim is current
                return 'waiting';
            }

            // If the status is not success AND they submitted something... we need a new directive
            if (appliedDirective.job_status.type !== 'success') {
                if (!stillNeeded()) {
                    return 'outdated';
                }
            }

            // If it was success and passed all the other checks we're good
            if (appliedDirective.job_status.type === 'success') {
                return 'fulfilled';
            }

            // Catch all for edge cases like a "invalidClaim" status
            return 'unfulfilled';
        },
    },
};
export type DirectivesList = (keyof typeof DIRECTIVES)[];
