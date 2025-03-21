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
    // TODO (RegistrationProgress) - we need to know if a directive was used during the current session (this can be just in memory)
    //  so we need to store off if the user used something. That way we know which directive is which step in the process.
    // updatedThisSession: boolean;
}

export interface DirectiveProps {
    directive: any;
    status: DirectiveStates;
    mutate: KeyedMutator<PostgrestSingleResponse<JoinedAppliedDirective[]>>;
}
