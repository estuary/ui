import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SuccessResponse } from 'hooks/supabase-swr';
import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { AppliedDirectives, PublicDatabase } from 'types/supabaseSchema';

// THESE MUST STAY IN SYNC WITH THE DB
export interface Directives {
    betaOnboard: DirectiveSettings<OnboardClaim>;
    clickToAccept: DirectiveSettings<ClickToAcceptClaim>;
    grant: DirectiveSettings<GrantClaim>;
}

export type DirectiveStates =
    | 'unfulfilled'
    | 'in progress'
    | 'fulfilled'
    | 'outdated'
    | 'errored';

export interface ClickToAcceptClaim {
    version: string;
}

export interface GrantClaim {
    requestedPrefix: string;
}

export interface OnboardClaim {
    requestedTenant: string;
    survey: any;
}

export type UserClaims = ClickToAcceptClaim | GrantClaim | OnboardClaim;

export interface DirectiveSettings<T> {
    token: string;
    queryFilter: (
        queryBuilder: PostgrestFilterBuilder<
            PublicDatabase,
            AppliedDirectives,
            JoinedAppliedDirective
        >
    ) => PostgrestFilterBuilder<
        PublicDatabase,
        AppliedDirectives,
        JoinedAppliedDirective
    >;
    generateUserClaim: (args: any[]) => T;
    calculateStatus: (
        appliedDirective?: AppliedDirective<T> | null
    ) => DirectiveStates;
}

export interface DirectiveProps {
    directive: any;
    status: DirectiveStates;
    mutate: KeyedMutator<SuccessResponse<JoinedAppliedDirective>>;
}
