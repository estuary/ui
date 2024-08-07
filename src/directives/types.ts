import {
    PostgrestFilterBuilder,
    PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';

// THESE MUST STAY IN SYNC WITH THE DB
export interface Directives {
    acceptDemoTenant: DirectiveSettings<AcceptDemoTenantClaim>;
    betaOnboard: DirectiveSettings<OnboardClaim>;
    clickToAccept: DirectiveSettings<ClickToAcceptClaim>;
    grant: DirectiveSettings<GrantClaim>;
    storageMappings: DirectiveSettings<StorageMappingsClaim>;
}

export type DirectiveStates =
    | 'unfulfilled'
    | 'in progress'
    | 'waiting'
    | 'fulfilled'
    | 'outdated'
    | 'errored';

export interface AcceptDemoTenantClaim {
    tenant: string;
}

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

export interface StorageMappingsClaim {
    addStore: object;
    catalogPrefix: string;
}

export type UserClaims =
    | AcceptDemoTenantClaim
    | ClickToAcceptClaim
    | GrantClaim
    | OnboardClaim
    | StorageMappingsClaim;

// TODO (V2 typing) - queryFilter should take in filter builder better
export interface DirectiveSettings<T> {
    token: string;
    queryFilter: (
        queryBuilder: any //PostgrestFilterBuilder<any, any, any>
    ) => PostgrestFilterBuilder<any, any, any>;
    generateUserClaim: (args: any[]) => T;
    calculateStatus: (
        appliedDirective?: AppliedDirective<T> | null
    ) => DirectiveStates;
}

export interface DirectiveProps {
    directive: any;
    status: DirectiveStates;
    mutate: KeyedMutator<PostgrestSingleResponse<JoinedAppliedDirective[]>>;
}
