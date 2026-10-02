import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { AppliedDirective } from 'src/types';

// THESE MUST STAY IN SYNC WITH THE DB
export interface Directives {
    acceptDemoTenant: DirectiveSettings<AcceptDemoTenantClaim>;
}

export type JobStatusQueryData = Pick<
    AppliedDirective<UserClaims>,
    'logs_token' | 'directive_id' | 'id'
>;

export type DirectiveStates =
    | 'unfulfilled'
    | 'in progress'
    | 'waiting'
    | 'fulfilled'
    | 'outdated'
    | 'errored';

interface AcceptDemoTenantClaim {
    tenant: string;
}

export type UserClaims = AcceptDemoTenantClaim;

// TODO (V2 typing) - queryFilter should take in filter builder better
interface DirectiveSettings<T> {
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
