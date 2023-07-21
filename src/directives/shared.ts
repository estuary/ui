import { isEmpty } from 'lodash';
import { AppliedDirective } from 'types';

import { CustomEvents, logRocketEvent } from 'services/logrocket';
import { JOB_STATUS_COLUMNS, supabaseClient, TABLES } from 'services/supabase';

import { hasLength } from 'utils/misc-utils';

import { Directives, UserClaims } from './types';

export const CLICK_TO_ACCEPT_LATEST_VERSION = 'v2';

export const jobCompleted = (
    appliedDirective?: AppliedDirective<UserClaims>
) => {
    return appliedDirective?.job_status.type === 'success';
};

export const claimSubmitted = (
    appliedDirective?: AppliedDirective<UserClaims>
) => {
    return appliedDirective?.user_claims !== null;
};

export const jobStatusQuery = (data: AppliedDirective<UserClaims>) => {
    return supabaseClient
        .from<AppliedDirective<UserClaims>>(TABLES.APPLIED_DIRECTIVES)
        .select(JOB_STATUS_COLUMNS)
        .match({
            logs_token: data.logs_token,
            directive_id: data.directive_id,
            id: data.id,
        });
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
    betaOnboard: {
        token: '453e00cd-e12a-4ce5-b12d-3837aa385751',
        queryFilter: (queryBuilder) => {
            return queryBuilder;
        },
        generateUserClaim: (args: any[]) => {
            return {
                requestedTenant: args[0],
                survey: args.length > 1 ? args[1] : null,
            };
        },
        calculateStatus: (appliedDirective) => {
            const stillNeeded = () => {
                return !hasLength(
                    appliedDirective?.user_claims?.requestedTenant
                );
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
                if (
                    appliedDirective.user_claims?.requestedTenant &&
                    appliedDirective.user_claims.requestedTenant.length > 0
                ) {
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
    clickToAccept: {
        token: 'd4a37dd7-1bf5-40e3-b715-60c4edd0f6dc',
        queryFilter: (queryBuilder) => {
            return queryBuilder;
        },
        generateUserClaim: (args: any[]) => {
            return {
                version: args[0],
            };
        },
        calculateStatus: (appliedDirective?) => {
            const stillNeeded = () => {
                return (
                    appliedDirective?.user_claims?.version &&
                    appliedDirective.user_claims.version !==
                        CLICK_TO_ACCEPT_LATEST_VERSION
                );
            };

            // If there is no directive to check it is unfulfilled
            if (!appliedDirective || isEmpty(appliedDirective)) {
                return 'unfulfilled';
            }

            // If directive already queued and ...
            if (appliedDirective.job_status.type === 'queued') {
                // no claim is there we can just use that directive again
                if (!appliedDirective.user_claims) {
                    return 'in progress';
                }

                // queued claim is outdate
                if (stillNeeded()) {
                    return 'outdated';
                }

                // queued claim is current
                return 'waiting';
            }

            // If previous claim is outdate then we need a new directive
            if (stillNeeded()) {
                return 'outdated';
            }

            // If it was success and passed all the other checks we're good
            if (appliedDirective.job_status.type === 'success') {
                return 'fulfilled';
            }

            // Catch all for edge cases like a "invalidClaim" status
            return 'unfulfilled';
        },
    },
    grant: {
        token: '',
        queryFilter: (queryBuilder) => {
            return queryBuilder;
        },
        generateUserClaim: (args: any[]) => {
            return {
                requestedPrefix: args[0],
            };
        },
        calculateStatus: (appliedDirective?) => {
            // If there is no directive to check it is unfulfilled
            if (!appliedDirective || isEmpty(appliedDirective)) {
                return 'unfulfilled';
            }

            // If directive already queued and no claim is there we can just use that directive again
            if (
                appliedDirective.job_status.type === 'queued' &&
                !appliedDirective.user_claims
            ) {
                return 'in progress';
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

export const trackEvent = (
    type: string,
    directive?: AppliedDirective<UserClaims>
) => {
    logRocketEvent(
        `${CustomEvents.DIRECTIVE}:${type}`,
        directive
            ? {
                  id: directive.id,
                  directive_id: directive.directive_id,
                  logs_token: directive.logs_token,
                  status: directive.job_status.type,
              }
            : undefined
    );
};
