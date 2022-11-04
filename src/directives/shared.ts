import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { JOB_STATUS_COLUMNS, supabaseClient, TABLES } from 'services/supabase';
import { AppliedDirective } from 'types';
import { CLICK_TO_ACCEPT_LATEST_VERSION } from './ClickToAccept';
import {
    ClickToAcceptClaim,
    DirectiveSettings,
    OnboardClaim,
    UserClaims,
} from './types';

export enum DirectiveStates {
    UNFULFILLED = 'unfulfilled',
    IN_PROGRESS = 'in progress',
    FUFILLED = 'fulfilled',
    OUTDATED = 'outdated',
}

// THESE MUST STAY IN SYNC WITH THE DB
interface Directives {
    betaOnboard: DirectiveSettings<OnboardClaim>;
    clickToAccept: DirectiveSettings<ClickToAcceptClaim>;
}

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
                return DirectiveStates.UNFULFILLED;
            }

            if (!appliedDirective.user_claims) {
                return DirectiveStates.IN_PROGRESS;
            }

            if (
                appliedDirective.job_status.type !== 'success' &&
                appliedDirective.user_claims.requestedTenant &&
                appliedDirective.user_claims.requestedTenant.length > 0
            ) {
                return DirectiveStates.IN_PROGRESS;
            }

            if (appliedDirective.job_status.type === 'success') {
                return DirectiveStates.FUFILLED;
            }

            return DirectiveStates.UNFULFILLED;
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
                return DirectiveStates.UNFULFILLED;
            }

            if (!appliedDirective.user_claims) {
                return DirectiveStates.IN_PROGRESS;
            }

            if (
                appliedDirective.user_claims.version &&
                appliedDirective.user_claims.version !==
                    CLICK_TO_ACCEPT_LATEST_VERSION
            ) {
                return DirectiveStates.OUTDATED;
            }

            if (appliedDirective.job_status.type === 'success') {
                return DirectiveStates.FUFILLED;
            }

            return DirectiveStates.UNFULFILLED;
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
