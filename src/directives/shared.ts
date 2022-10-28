import { JOB_STATUS_COLUMNS, supabaseClient, TABLES } from 'services/supabase';
import { AppliedDirective } from 'types';
import { ClickToAcceptClaim, DirectiveSettings, OnboardClaim } from './types';

// THESE MUST STAY IN SYNC WITH THE DB
interface Directives {
    [key: string]: DirectiveSettings;
}

export const jobCompleted = (appliedDirective?: AppliedDirective) => {
    return appliedDirective?.job_status.type === 'success';
};

export const claimSubmitted = (appliedDirective?: AppliedDirective) => {
    return appliedDirective?.user_claims !== null;
};

export const jobStatusQuery = (data: AppliedDirective) => {
    return supabaseClient
        .from<AppliedDirective>(TABLES.APPLIED_DIRECTIVES)
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
        generateUserClaim: (args: any[]): OnboardClaim => {
            return { requestedTenant: args[0] };
        },
        isClaimFulfilled: (appliedDirective?: AppliedDirective): boolean => {
            if (!appliedDirective) return false;

            return Boolean(
                claimSubmitted(appliedDirective) &&
                    jobCompleted(appliedDirective)
            );
        },
    },
    clickToAccept: {
        id: '07:af:85:52:70:00:0c:00',
        token: 'd4a37dd7-1bf5-40e3-b715-60c4edd0f6dc',
        generateUserClaim: (args: any[]): ClickToAcceptClaim => {
            return {
                version: args[0],
            };
        },
        isClaimFulfilled: (appliedDirective?: AppliedDirective): boolean => {
            console.log('ClickToAccept:ClaimCheck', appliedDirective);
            if (!appliedDirective) return false;

            return Boolean(
                claimSubmitted(appliedDirective) &&
                    jobCompleted(appliedDirective)
            );
        },
    },
};
export type DirectivesList = (keyof typeof DIRECTIVES)[];
