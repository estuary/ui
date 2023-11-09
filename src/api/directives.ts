import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { DIRECTIVES } from 'directives/shared';
import { UserClaims } from 'directives/types';
import {
    CallSupabaseResponse,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    insertSupabase,
    RPCS,
    SortingProps,
    supabaseClient,
    supabaseRetry,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import {
    AppliedDirective,
    Directive,
    GrantDirective,
    GrantDirectiveSpec,
    GrantDirective_AccessLinks,
    JoinedAppliedDirective,
    Schema,
} from 'types';

interface GrantDirective_CreateMatchData {
    catalog_prefix: string;
    spec: GrantDirectiveSpec;
    uses_remaining?: number | null;
}

export interface ExchangeResponse {
    directive: Directive | null; // Only null so we can "fake" this response below
    applied_directive: AppliedDirective<UserClaims>;
}

const generateMatchData = (data: ExchangeResponse['applied_directive']) => {
    return {
        id: data.id,
        logs_token: data.logs_token,
        directive_id: data.directive_id,
        user_id: data.user_id,
    };
};

const callUpdate = (
    user_claims: Schema,
    response: ExchangeResponse['applied_directive']
) => {
    return updateSupabase(
        TABLES.APPLIED_DIRECTIVES,
        {
            user_claims,
        },
        generateMatchData(response)
    );
};

const exchangeBearerToken = async (token: string) => {
    return supabaseRetry<PostgrestSingleResponse<ExchangeResponse>>(
        () =>
            supabaseClient
                .rpc(RPCS.EXCHANGE_DIRECTIVES, {
                    bearer_token: token,
                })
                .single(),
        'exchangeBearerToken'
    );
};

const submitDirective = async (
    type: keyof typeof DIRECTIVES,
    existingDirective?: AppliedDirective<UserClaims>,
    ...dataForClaim: any[]
) => {
    let data: ExchangeResponse | null, error;
    if (!existingDirective) {
        try {
            const response = await exchangeBearerToken(DIRECTIVES[type].token);
            data = response.data;
            error = response.error;
        } catch (e: unknown) {
            data = null;
            error = e;
        }
    } else {
        data = { directive: null, applied_directive: existingDirective };
    }

    if (error || !data) {
        console.error('error', error);
        return { data: [], error };
    } else {
        return callUpdate(
            DIRECTIVES[type].generateUserClaim(dataForClaim),
            data.applied_directive
        );
    }
};

// Called through SWR so do not need to manually retry
const getAppliedDirectives = (
    type: keyof typeof DIRECTIVES,
    userId: string,
    token?: string
) => {
    let queryBuilder = supabaseClient.from<JoinedAppliedDirective>(
        TABLES.APPLIED_DIRECTIVES
    ).select(`
            id,
            directive_id,
            job_status,
            logs_token,
            user_id,
            user_claims,
            updated_at,
            directives !inner(uses_remaining, spec->>type)
        `);

    queryBuilder = queryBuilder.eq('directives.spec->>type', type);
    queryBuilder = queryBuilder.eq('user_id', userId);

    if (token) {
        queryBuilder = queryBuilder.eq('directives.token', token);
    }

    return DIRECTIVES[type]
        .queryFilter(queryBuilder)
        .order('updated_at', { ascending: false })
        .limit(1);
};

const generateGrantDirective = (
    prefix: string,
    capability: string,
    singleUse?: boolean
): PromiseLike<CallSupabaseResponse<GrantDirective[]>> => {
    let data: GrantDirective_CreateMatchData = {
        catalog_prefix: prefix,
        spec: {
            type: 'grant',
            grantedPrefix: prefix,
            capability,
        },
    };

    if (singleUse) {
        data = { ...data, uses_remaining: 1 };
    }
    return insertSupabase(TABLES.DIRECTIVES, data);
};

const getDirectiveByToken = async (token: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DIRECTIVES)
                .select(`spec,token`)
                .eq('token', token),
        'getDirectiveByToken'
    ).then(
        handleSuccess<Pick<GrantDirective, 'spec' | 'token'>[]>,
        handleFailure
    );

    return data;
};

// Used in table hydrator which handles the retrying
const getDirectivesByType = (
    directiveType: keyof typeof DIRECTIVES,
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from(TABLES.DIRECTIVES)
        .select(`id,catalog_prefix,uses_remaining,spec,token,updated_at`, {
            count: 'exact',
        })
        .eq('spec->>type', directiveType)
        .or(`uses_remaining.eq.1,uses_remaining.is.null`);

    queryBuilder = defaultTableFilter<GrantDirective_AccessLinks>(
        queryBuilder,
        ['catalog_prefix', `spec->>capability`, `spec->>grantedPrefix`],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

const disableDirective = (directiveId: string) => {
    return updateSupabase(
        TABLES.DIRECTIVES,
        { uses_remaining: 0 },
        { id: directiveId }
    );
};

export {
    disableDirective,
    exchangeBearerToken,
    generateGrantDirective,
    getAppliedDirectives,
    getDirectivesByType,
    getDirectiveByToken,
    submitDirective,
};
