import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SuccessResponse } from 'hooks/supabase-swr';
import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';

// THESE MUST STAY IN SYNC WITH THE DB
export interface Directives {
    betaOnboard: DirectiveSettings<OnboardClaim>;
    clickToAccept: DirectiveSettings<ClickToAcceptClaim>;
}

export type DirectiveStates =
    | 'unfulfilled'
    | 'in progress'
    | 'fulfilled'
    | 'outdated';

export interface ClickToAcceptClaim {
    version: string;
}

export interface OnboardClaim {
    requestedTenant: string;
}

export type UserClaims = ClickToAcceptClaim | OnboardClaim;

export interface DirectiveSettings<T> {
    calculateStatus: (
        appliedDirective?: AppliedDirective<T> | null
    ) => DirectiveStates;
    generateUserClaim: (args: any[]) => T;
    queryFilter: (
        queryBuilder: PostgrestFilterBuilder<JoinedAppliedDirective>
    ) => PostgrestFilterBuilder<JoinedAppliedDirective>;
    token: string;
}

export interface DirectiveProps {
    directive: any;
    mutate: KeyedMutator<SuccessResponse<JoinedAppliedDirective>>;
    status: DirectiveStates;
}
