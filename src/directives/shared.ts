import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { JOB_STATUS_COLUMNS, supabaseClient, TABLES } from 'services/supabase';
import { AppliedDirective } from 'types';
import { Directives, UserClaims } from './types';

export const CLICK_TO_ACCEPT_LATEST_VERSION = 'v1';

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
    betaOnboard: {
        id: '07:af:85:52:70:00:10:00',
        token: '453e00cd-e12a-4ce5-b12d-3837aa385751',
        queryFilter: (queryBuilder) => {
            return queryBuilder;
        },
        generateUserClaim: (args: any[]) => {
            return { requestedTenant: args[0] };
        },
        calculateStatus: (appliedDirective) => {
            if (!appliedDirective || isEmpty(appliedDirective)) {
                return 'unfulfilled';
            }

            if (!appliedDirective.user_claims) {
                return 'in progress';
            }

            if (
                appliedDirective.job_status.type !== 'success' &&
                appliedDirective.user_claims.requestedTenant &&
                appliedDirective.user_claims.requestedTenant.length > 0
            ) {
                return 'in progress';
            }

            if (appliedDirective.job_status.type === 'success') {
                return 'fulfilled';
            }

            return 'unfulfilled';
        },
    },
    clickToAccept: {
        id: '07:af:85:52:70:00:0c:00',
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
            if (!appliedDirective || isEmpty(appliedDirective)) {
                return 'unfulfilled';
            }

            if (!appliedDirective.user_claims) {
                return 'in progress';
            }

            if (
                appliedDirective.user_claims.version &&
                appliedDirective.user_claims.version !==
                    CLICK_TO_ACCEPT_LATEST_VERSION
            ) {
                return 'outdated';
            }

            if (appliedDirective.job_status.type === 'success') {
                return 'fulfilled';
            }

            return 'unfulfilled';
        },
    },
};
export type DirectivesList = (keyof typeof DIRECTIVES)[];

export const trackEvent = (
    type: string,
    directive: AppliedDirective<UserClaims>
) => {
    LogRocket.track(`directive:${type}`, {
        id: directive.id,
        directive_id: directive.directive_id,
        logs_token: directive.logs_token,
        status: directive.job_status.type,
    });
};
