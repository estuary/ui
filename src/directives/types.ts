import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SuccessResponse } from 'hooks/supabase-swr';
import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { DirectiveStates } from './shared';

export interface ClickToAcceptClaim {
    version: string;
}

export interface OnboardClaim {
    requestedTenant: string;
}

export type UserClaims = ClickToAcceptClaim | OnboardClaim;

export interface DirectiveSettings<T> {
    id: string;
    token: string;
    queryFilter: (
        queryBuilder: PostgrestFilterBuilder<JoinedAppliedDirective>
    ) => PostgrestFilterBuilder<JoinedAppliedDirective>;
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
